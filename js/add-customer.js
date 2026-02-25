// Navigation
window.goBack = function () {
    history.back();
}

// Validation
function isValidMobile(m) {
    if (!m) return true; // optional
    return /^[6-9]\d{9}$/.test(m);
}

// Bill State
const billState = {
    previousDue: 0,
    currentSale: 0,
    received: 0,
    due: 0
};

// Update sale
window.updateSale = function (val) {
    billState.currentSale = Number(val) || 0;
    recalc();
}

// Update received
window.updateReceived = function (val) {
    billState.received = Number(val) || 0;
    recalc();
}

// Calculate due
function recalc() {
    billState.due = billState.currentSale - billState.received;
    document.getElementById("remainingDue").innerText =
        billState.due.toFixed(2);
}

// Save
window.saveCustomer = function () {

    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();

    if (!name) {
        show("Customer name required", "error");
        return;
    }

    if (!isValidMobile(mobile)) {
        show("Invalid mobile number", "error");
        return;
    }

    const payload = {
        key: SECRET_KEY,
        action: "confirmBill",
        shopId: getShopId(),

        name: name,
        mobile: mobile,
        sale: billState.currentSale,
        received: billState.received,
        due: billState.due,

        type: "KHATA"
    };

    console.log("SAVE CUSTOMER →", payload);

    show("Saving...", "");

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(res => {
        if (res.status === "OK") {
            show("Customer saved", "success");
            document.querySelectorAll("input").forEach(i => i.value = "");
            billState.currentSale = 0;
            billState.received = 0;
            recalc();
        } else {
            show("Save failed", "error");
        }
    })
    .catch(() => show("Network error", "error"));
}


// Status helper
function show(msg, type) {
    const status = document.getElementById("status");
    status.textContent = msg;
    status.className = "status " + type;
}

fetch(API_URL, {
  method: "POST",
  body: JSON.stringify({
    key: SECRET_KEY,
    action: "confirmBill",
    shopId: getShopId(),

    name: customerName,
    mobile: phone,
    sale: saleAmount,
    received: receivedAmount,
    due: dueAmount,

    type: "KHATA"
  })
});

