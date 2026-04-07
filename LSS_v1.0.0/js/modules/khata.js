import {
getRam,
setRam,
getLocal,
setLocal
} from "../engine/cache-engine.js"


window.goBack = function () {
    location.href = "home.html";
}

// Force back to home page
history.pushState(null, null, location.href);

window.addEventListener("popstate", function () {
    location.href = "home.html";
});

let allCustomers = [];
let activeCustomers = [];

/**2️⃣ Smart Memory Cache (RAM Cache) */
let memoryKhataCache = null;

//2️⃣ API debounce (extra API call বন্ধ)
let khataLastFetch = 0;

let visibleCount = 20;

/***Step 1 — Cache Load Function */
function loadKhataFromCache() {

    const ram = getRam("khataCache");

    if (ram) {
        updateKhataUI(ram);
        return true;
    }

    const local = getLocal("khataCache");

    if (local) {
        updateKhataUI(local);
        return true;
    }

    return false;
}
function updateKhataUI(data) {

    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "none";

    const totalDue = data.reduce((sum, c) => sum + (Number(c.due) || 0), 0);

    let dueText = "";
    let dueColor = "";

    if (totalDue < 0) {
        dueText = " " + Math.abs(totalDue).toLocaleString("en-IN") + " ";
        dueColor = "green";
    } 
    else if (totalDue > 0) {
        dueText = " " + totalDue.toLocaleString("en-IN") + " ";
        dueColor = "red";
    } 
    else {
        dueText = "₹ 0 Settled";
        dueColor = "gray";
    }

    const el = document.getElementById("totalDue");

    el.textContent = dueText;   // ✅ FIX
    el.style.color = dueColor; // ✅ FIX

    console.log("Loaded Khata from Cache:", data);

    allCustomers = data;
    activeCustomers = data;

    renderKhata(data);
}
/**Step 2 — API Call with Cache Update */
// loadKhata Function
function loadKhata() {
    console.log("START API")

    const shopId = getShopId();
    console.log("shopId:", shopId)
    if (!shopId) return;

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
            console.log("Khata API:", res);

            if (res.status !== "success") return;
            
            const list = res.data || []
            list.sort( (a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate) );

            updateKhataUI( list);
            console.log("Khata List:", list);

            setRam("khataCache", list)
            setLocal("khataCache", list)

        })
        .catch(err => {
            console.error("API error:", err)
        })
}

function renderKhata(list) {

    if (!Array.isArray(list)) {
        console.error("Not array:", list);
        return;
    }

    const container = document.getElementById("khataList");
    // 🔥 Sort by latest transaction
    list.sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
    container.innerHTML = "";

    if (!list.length) {
        container.innerHTML = "<p class='empty'>No customer found</p>";
        return;
    }

    let html = "";

    list.slice(0, visibleCount).forEach(data => {
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
            <span class="edit-icon"
                onclick="editProfile('${data.id}','${data.name}','${data.mobile}')">

                <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor"
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04c.39-.39.39-1.02 
                0-1.41l-2.5-2.5a.9959.9959 0 0 0-1.41 
                0l-1.83 1.83 3.75 3.75 1.99-1.67z"/>
            </svg>

            </span>`;

        let mobileText = `<span class="khata-mobile">📱 ${data.mobile || "No mobile"}</span>`;

        let lastUpdateTime = data.lastUpdate ? new Date(data.lastUpdate).toLocaleDateString

            ("en-IN", {
                day: "2-digit",
                month: "short",
                year: "2-digit"
            }) : "No transactions";


        html += `
            <div class="khata-card" id="cust-${data.id}">
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

window.updateCustomerCard = function (customer) {

    const card = document.getElementById("cust-" + customer.id);

    if (!card) return;

    const due = Number(customer.due) || 0;

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

    card.querySelector(".khata-due").textContent = dueText;
    card.querySelector(".khata-due").style.color = dueColor;

}

/**Step 3 — Page Start Logic Change */
if (!loadKhataFromCache()) {
    loadKhata();
} else {
    // Background update for fresh data
    loadKhata();
}

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

            activeCustomers = allCustomers;
            visibleCount = 20;

            renderKhata(activeCustomers);
            return;
        }

        const filtered = allCustomers.filter(c =>
            (c.name && c.name.toLowerCase().includes(q)) ||
            (c.mobile && String(c.mobile).includes(q))
        );

        activeCustomers = filtered;
        visibleCount = 20;

        renderKhata(activeCustomers);

    }, 200);

};

window.handleSearchInput = function () {

    const input = document.getElementById("searchInput");
    const clearBtn = document.getElementById("clearSearchBtn");

    if (input.value.trim().length > 0) {
        clearBtn.style.display = "block";
    } else {
        clearBtn.style.display = "none";
    }

    searchKhataList();

}

window.clearSearch = function () {

    const input = document.getElementById("searchInput");
    const clearBtn = document.getElementById("clearSearchBtn");

    input.value = "";
    clearBtn.style.display = "none";

    renderKhata(allCustomers);

    // 🔥 input state reset
    input.focus();

}

window.filterKhata = function (type) {

    let filtered = [];

    if (type === "all") {
        filtered = allCustomers;
    }

    if (type === "due") {
        filtered = allCustomers.filter(c => Number(c.due) > 0);
    }

    if (type === "advance") {
        filtered = allCustomers.filter(c => Number(c.due) < 0);
    }

    if (type === "settled") {
        filtered = allCustomers.filter(c => Number(c.due) === 0);
    }

    renderKhata(filtered);

}
document.querySelectorAll(".chip").forEach(chip => {

    chip.addEventListener("click", function () {

        document.querySelectorAll(".chip").forEach(c => {
            c.classList.remove("active");
        });

        this.classList.add("active");

    });

});

window.addEventListener("scroll", function () {

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const pageHeight = document.body.offsetHeight;

    if (scrollTop + windowHeight >= pageHeight - 100) {

        if (visibleCount >= activeCustomers.length) return;

        visibleCount += 20;

        renderKhata(activeCustomers);

    }

});

function show(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function getShopId() {
    return localStorage.getItem("shopId");
}
