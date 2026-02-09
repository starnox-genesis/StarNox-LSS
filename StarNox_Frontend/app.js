
// ⚠️ এখানে তোমার GitHub repo নাম exactly বসাবে
const BASE_PATH = "/StarNox-LSS/StarNox_Frontend";

const API_URL = "https://script.google.com/macros/s/AKfycbxRtVhbcjM06_nDU4eU3YeRKwyfiudFyFNCy4ELNnfwh3G39ycdJ7hucVisfo7JZRgKvQ/exec";
const API_KEY = "STARNOX123";

function testToday() {
    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            key: API_KEY,
            action: "getToday"
        })
    })
        .then(res => res.json())
        .then(data => {
            alert(
                "Total Sale: ₹" + data.totalSale +
                "\nReceived: ₹" + data.received +
                "\nNew Due: ₹" + data.newDue
            );
        })
        .catch(err => alert("Error: " + err));
}

let billState = {
    customerId: "",
    customerName: "",
    previousDue: 0,   // 🔥 এটা ADD করো
    currentSale: 0,
    received: 0,
    total: 0,
    due: 0
};
//update the current sale amount in the bill state
function updateSale(val) {
    billState.currentSale = Number(val) || 0;
}

//Update the received amount and calculate the remaining due
function updateReceived(val) {
    billState.received = Number(val) || 0;
    billState.due = billState.total - billState.received;

    document.getElementById("remainingDue").innerText = billState.due;
}

/* ===== App Start ===== */
document.addEventListener("DOMContentLoaded", () => {
    loadPage("home");
});

/* ===== Page Loader ===== */
function loadPage(page) {
    fetch(`${BASE_PATH}/pages/${page}.html`)
        .then(res => {
            if (!res.ok) throw new Error("Page not found");
            return res.text();
        })
        .then(html => {
            document.getElementById("app").innerHTML = html;

            // ✅ DOM ready AFTER insert
            if (page === "preview") renderPreview();
            if (page === "home") loadTodaySummary();
            if (page === "khata") loadKhata();
            if (page === "history") loadHistory();
        });
    .catch(err => console.error("Page load error"));
}


// Render the bill preview based on the current bill state
function renderPreview() {
    console.log("renderPreview called", billState);

    const prev = Number(billState.previousDue) || 0;
    const sale = Number(billState.currentSale) || 0;

    billState.total = prev + sale;

    const prevEl = document.getElementById("prevDue");
    const saleEl = document.getElementById("currSale");
    const totalEl = document.getElementById("grandTotal");
    const remainEl = document.getElementById("remainingDue");

    if (!prevEl || !saleEl || !totalEl || !remainEl) {
        console.error("Preview DOM not ready");
        return;
    }

    prevEl.innerText = prev;
    saleEl.innerText = sale;
    totalEl.innerText = billState.total;
    remainEl.innerText = billState.total;
}

// Load today's summary when the home page is loaded
function loadTodaySummary() {
    fetch(API_URL, {
        method: "POST",
        // headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            key: API_KEY,
            action: "getToday"
        })
    })
        .then(res => res.json())
        .then(data => {
            document.getElementById("todaySale").innerText = "₹" + data.totalSale;
            document.getElementById("todayReceived").innerText = "₹" + data.received;
            document.getElementById("todayDue").innerText = "₹" + data.newDue;
        })
        .catch(err => console.error(err));
}



// Save a new bill transaction
function saveBill() {
    if (billState.due > 0 && !billState.customerName) {
        alert("Due আছে — কাস্টমারের নাম দিতে হবে");
        return;
    }
    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            key: API_KEY,
            action: "saveTransaction",
            customerId: billState.customerId || "",
            customerName: billState.customerName || "",
            saleAmount: billState.currentSale,
            receivedAmount: billState.received,
            mode: "CASH",
            type: "SALE"
        })
    })
        .then(res => res.json())
        .then(res => {
            if (res.status === "OK") {
                alert("Transaction saved");
                resetBill();
                loadPage("home");
            } else {
                alert("Save failed");
            }
        })
        .catch(err => alert("Error: " + err));
}

function resetBill() {
    billState = {
        customerId: "",
        customerName: "",
        previousDue: 0,
        currentSale: 0,
        received: 0,
        total: 0,
        due: 0
    };
}

// Load the list of customers with dues
function loadKhata() {
    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            key: API_KEY,
            action: "getKhata"
        })
    })
        .then(res => res.json())
        .then(list => {
            const box = document.getElementById("khataList");

            if (!list.length) {
                box.innerHTML = "<p>No due customers</p>";
                return;
            }

            box.innerHTML = list.map(
                r => `<div class="section">
              <b>${r.name}</b><br>
              Due: ₹${r.due}
            </div>`
            ).join("");
        })
        .catch(err => console.error(err));
}

function loadHistory() {
    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            key: API_KEY,
            action: "getHistory"
        })
    })
        .then(res => res.json())
        .then(list => {
            const box = document.getElementById("historyList");

            if (!list.length) {
                box.innerHTML = "<p>No transactions yet</p>";
                return;
            }

            box.innerHTML = list.map(
                r => `<div class="section">
                <b>${r.name}</b><br>
                ${r.date} |
                SaleAmount: ₹${r.sale} |
                ReceivedAmount: ₹${r.received}
              </div>`
            ).join("");
        })
        .catch(err => console.error(err));
}
