// Navigation
window.goBack = function () {
    history.back();
};

// Load customer from khata
const data = JSON.parse(localStorage.getItem("updateCustomer"));

let previousDue = 0;

if (!data) {
    // No customer selected → go back to khata
    alert("No customer selected");
    location.href = "khata.html";
} else {
    previousDue = data.due;

    document.getElementById("custName").textContent = data.name;
    document.getElementById("headerDue").textContent = data.due.toLocaleString();
    document.getElementById("prevDueText").textContent = data.due.toLocaleString();
}



// Elements
const saleEl = document.getElementById("sale");
const receivedEl = document.getElementById("received");

// Init
window.addEventListener("DOMContentLoaded", () => {
    updateRemain();
});



// Live calculation
saleEl.addEventListener("input", updateRemain);
receivedEl.addEventListener("input", updateRemain);

function num(v) {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
}

function updateRemain() {
    const s = num(saleEl.value);
    const r = num(receivedEl.value);
    const remain = previousDue + s - r;
    document.getElementById("remain").textContent = fmt(remain);
}

// Confirm update
window.confirmUpdate = function () {

    const sale = Number(saleEl.value) || 0;
    const received = Number(receivedEl.value) || 0;

    const updateData = JSON.parse(localStorage.getItem("updateCustomer"));

    const newDue = previousDue + sale - received;

    const payload = {
        key: SECRET_KEY,
        action: "updateBill",
        shopId: localStorage.getItem("shopId"),
        customerId: updateData.id,
        customerName: updateData.name,
        saleAmount: sale,
        receivedAmount: received,
        due: newDue
    };

    console.log("UPDATE BILL →", payload);
    show("Updating...", "");

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(res => {
        console.log("Server Response:", res);

        if (res.status === "OK") {
            document.getElementById("status").innerText = "Update Success";
            location.href = "khata.html";
        } else {
            document.getElementById("status").innerText = "Update Failed";
        }
    })
    .catch(() => {
        document.getElementById("status").innerText = "Network Error";
    });
};




// Helpers
function fmt(n) {
    return n.toLocaleString("en-IN");
}

function show(msg, type) {
    const status = document.getElementById("status");
    status.textContent = msg;
    status.className = "status " + type;
}
