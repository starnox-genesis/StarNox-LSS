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

    list.forEach(c => {

        container.innerHTML += `
    <div class="khata-card">
        <div class="khata-top">
            <div class="khata-name">${c.name}</div>
            <div class="khata-due">₹${c.due} Due</div>
        </div>

        <div class="khata-actions">
            <button class="btn-outline"
                onclick="goUpdate('${c.id}', '${c.name}', ${c.due})">
                Update
            </button>

            <button class="btn-outline"
                onclick="payCustomer('${c.id}', '${c.name}', ${c.due})">
                Payment
            </button>
        </div>
    </div>
    `;
    });

}


loadKhata();

window.goUpdate = function(id, name, due) {

    localStorage.setItem("updateCustomer", JSON.stringify({
        id: id,      // ✅ এখন ID save হচ্ছে
        name: name,
        due: due
        // shopId: localStorage.getItem("shopId")
    }));

    location.href = "update-bill.html";
};


window.payCustomer = function (id, name, due) {

    // customer data save
    localStorage.setItem("payCustomer", JSON.stringify({
        id: id,
        name: name,
        due: due,
        shopId: localStorage.getItem("shopId")
    }));

    // go to payment page
    location.href = "receive-payment.html";
}
window.addCustomer = function () {
    location.href = "add-customer.html";
}