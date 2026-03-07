

window.goBack = function () {
    location.href = "home.html";
}

function loadKhata() {

    const shopId = getShopId();
    if (!shopId) return;

    const loader = document.getElementById("loader");
    const container = document.getElementById("khataList");

    loader.style.display = "block";
    container.innerHTML = "";

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            key: SECRET_KEY,
            action: "getKhataList",
            shopId: shopId
        })
    })
        .then(res => res.json())
        .then(res => {

            loader.style.display = "none";

            console.log("Khata API:", res);

            const list = res.data || res;

            if (!Array.isArray(list)) {
                alert("Invalid data format");
                return;
            }

            renderKhata(list);

        })

        .catch(err => {
            loader.style.display = "none";
            container.innerHTML = "<p>Error loading data</p>";
            console.error(err);
        });
}

function renderKhata(list) {

    if (!Array.isArray(list)) {
        console.error("Not array:", list);
        return;
    }

    const container = document.getElementById("khataList");
    container.innerHTML = "";

    if (!list.length) {
        container.innerHTML = "<p class='empty'>No due customers</p>";
        return;
    }

    list.forEach(data => {
        const due = Number(data.due) || 0;

        let dueText = "";
        let dueColor = "";
        let mobileText = data.mobile ? "📱 " + data.mobile : "No mobile";
        let lastUpdateTime = data.lastUpdate ? new Date(data.lastUpdate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "2-digit"
        }) : "No transactions";

        if (due < 0) {
            dueText = "₹ " + Math.abs(due).toLocaleString("en-IN")+ " Advance";
            dueColor = "green";
        } else if (due > 0) {
            dueText = "₹ " + due.toLocaleString("en-IN") + " Due";
            dueColor = "red";
        } else {
            dueText = "0";
            dueColor = "gray";
        }

        container.innerHTML += `
    <div class="khata-card">
        <div class="khata-top">
            <div class="khata-name">${data.name}</div>
            <div class="khata-due" style="color: ${dueColor}">${dueText}</div>
        </div>
        <div class="khata-top">
            <div class="">${mobileText}</div>
            <div class="khata-lastUpdate">${lastUpdateTime}</div>
        </div>

        <div class="khata-actions">
            <button class="btn-outline"
                onclick="goUpdate('${data.id}', '${data.name}', '${data.due}', '${lastUpdateTime}')">
                Update
            </button>

            <button class="btn-outline"
                onclick="payCustomer('${data.id}', '${data.name}', '${data.due}', '${lastUpdateTime}')">
                Payment
            </button>
        </div>
    </div>
    `;
    });

}


loadKhata();

window.goUpdate = function(id, name, due, lastUpdateTime) {

    localStorage.setItem("updateCustomer", JSON.stringify({
        id: id,      // ✅ এখন ID save হচ্ছে
        name: name,
        due: due,
        lastUpdateTime: lastUpdateTime,
        
        shopId: localStorage.getItem("shopId")
    }));

    location.href = "update-bill.html";
};


window.payCustomer = function (id, name, due, lastUpdateTime) {

    // customer data save
    localStorage.setItem("payCustomer", JSON.stringify({
        id: id,
        name: name,
        due: due,
        lastUpdateTime: lastUpdateTime,
        shopId: localStorage.getItem("shopId")
    }));

    // go to payment page
    location.href = "receive-payment.html";
}
window.addCustomer = function () {
    location.href = "add-customer.html";
}