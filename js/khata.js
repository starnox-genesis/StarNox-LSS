

window.goBack = function () {
    location.href = "home.html";
}
let allCustomers = [];

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

            // Search Function
            allCustomers = list;

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
        container.innerHTML = "<p class='empty'>No customer found</p>";
        return;
    }

    let html = "";

    list.forEach(data => {
        const due = Number(data.due) || 0;

        let dueText = "";
        let dueColor = "";
        if (due < 0) {
            dueText = "₹ " + Math.abs(due).toLocaleString("en-IN") + " Advance";
            dueColor = "green";
        } else if (due > 0) {
            dueText = "₹ " + due.toLocaleString("en-IN") + " Due";
            dueColor = "red";
        } else {
            dueText = "0";
            dueColor = "gray";
        }

        let name = `<span class="khata-name">${data.name}</span>` || "No name";

        let profileEditIcon = `
            <span class="material-icons edit-icon"
            onclick="editProfile('${data.id}','${data.name}','${data.mobile}')">
            edit
            </span>`;

        let mobileText = `<span class="khata-mobile">📱 ${data.mobile || "No mobile"}</span>`;

        let lastUpdateTime = data.lastUpdate ? new Date(data.lastUpdate).toLocaleDateString

            ("en-IN", {
                day: "2-digit",
                month: "short",
                year: "2-digit"
            }) : "No transactions";


        html += `
            <div class="khata-card">
                <div class="khata-top">
                    <div class="khata-name-row">
                        <span >${name}</span>
                        <span >${profileEditIcon}</span>
                    </div>
                    <div class="khata-due" style="color: ${dueColor}">${dueText}</div>
                </div>
                <div class="khata-top">
                    <div >${mobileText} </div>
                    <div class="khata-lastUpdate">${lastUpdateTime}</div>
                </div>

                <div class="khata-actions">
                    <button class="btn-outline"
                        onclick="goUpdate('${data.id}', '${data.name}', '${data.due}', '${lastUpdateTime}')">
                        Add Sale
                    </button>

                    <button class="btn-outline"
                        onclick="payCustomer('${data.id}', '${data.name}', '${data.due}', '${lastUpdateTime}')">
                        Receive Payment
                    </button>
                </div>
            </div>
            `;
            });
            container.innerHTML = html;

}


loadKhata();

window.goUpdate = function (id, name, due, lastUpdateTime) {

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

window.editProfile = function (id, name, mobile) {

    // customer data save
    localStorage.setItem("editCustomer", JSON.stringify({
        id: id,
        name: name,
        mobile: mobile,
        shopId: localStorage.getItem("shopId")
    }));

    // go to profile page
    location.href = "edit-profile.html";
}
window.addCustomer = function () {
    location.href = "add-customer.html";
}

let searchTimer;

window.searchKhataList = function () {

    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {

        const q = document
            .getElementById("searchInput")
            .value
            .trim()
            .toLowerCase();

        if (!q) {
            renderKhata(allCustomers);
            return;
        }

        const filtered = allCustomers.filter(c =>
            (c.name && c.name.toLowerCase().includes(q)) ||
            (c.mobile && String(c.mobile).includes(q))
        );

        renderKhata(filtered);

    }, 200);

};

window.filterKhata = function(type){

 let filtered = [];

 if(type === "all"){
   filtered = allCustomers;
 }

 if(type === "due"){
   filtered = allCustomers.filter(c => Number(c.due) > 0);
 }

 if(type === "advance"){
   filtered = allCustomers.filter(c => Number(c.due) < 0);
 }

 if(type === "settled"){
   filtered = allCustomers.filter(c => Number(c.due) === 0);
 }

 renderKhata(filtered);

}
