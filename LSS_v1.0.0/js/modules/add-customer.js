

// Navigation
window.goBack = function () {
    location.replace("khata.html");
};
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
    updateRemain();
}

// Update received
window.updateReceived = function (val) {
    billState.received = Number(val) || 0;
    updateRemain();
}
// document.getElementById("allowAdvance")
//     .addEventListener("change", updateRemain);  Advance option Off
// Calculate due
function updateRemain() {

    billState.due = billState.currentSale - billState.received;

    const remainEl = document.getElementById("remainingDue");
    const labelEl = document.getElementById("remainLabel");
    // const allowAdvance = document.getElementById("allowAdvance").checked; Advance option Off
    const remain = billState.due;

    if (remain < 0) {
        if (false) {
            labelEl.textContent = "Advance";
            labelEl.style.fontWeight = "bold";
            remainEl.textContent = "₹ " + fmt(Math.abs(remain));
            remainEl.style.color = "#16a34a";
            remainEl.style.fontStyle = "italic";
        } else {
            labelEl.textContent = "Remaining Due";
            remainEl.textContent = "₹ 0";
            remainEl.style.color = "#dc2626";
        }
    } else {
        labelEl.textContent = "Remaining Due";
        remainEl.textContent = "₹ " + fmt(remain);
        remainEl.style.color = remain > 0 ? "#dc2626" : "#16a34a";
    }
 
}

// Save
window.saveCustomer = function () {

    const name = document.getElementById("name").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const saleAmount = billState.currentSale;
    const receivedAmount = billState.received;
  

    const newDue = billState.due;
    // const allowAdvance = document.getElementById("allowAdvance").checked;

    if (!name) {
        show("Customer name required", "error");
        return;
    }

    if (!isValidMobile(mobile)) {
        show("Invalid mobile number", "error");
        return;
    }
        if (newDue < 0 && !false) {  // Advance option Off
        show("Amount exceeds pending due. Enable Advance to continue.");
        return;
    }

    const payload = {
        key: SECRET_KEY,
        action: "confirmBill",
        shopId: getShopId(),
        name: name,
        mobile: mobile,
        sale: saleAmount,
        received: receivedAmount,
        due: newDue,
        type: "NEW_CUSTOMER"
    };

    console.log("SAVE CUSTOMER →", payload);

    show("Saving...", "");

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    })
        .then(res => res.text()) // safer than res.json()
        .then(text => {

            console.log("Raw response:", text);

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                show("Invalid server response", "error");
                return;
            }

            if (data.status === "OK" || data.status === "success") {

                show("Customer saved", "success");

                // Reset form
                document.querySelectorAll("input").forEach(i => i.value = "");
                document.getElementById("allowAdvance").checked = false;

                billState.currentSale = 0;
                billState.received = 0;
                billState.due = 0;

                updateRemain();

            } else {
                show("Save failed", "error");
            }
        })
        .catch(err => {
            console.error("Fetch error:", err);
            show("Network error", "error");
        });
};

// Helpers
function fmt(n) {
    return n.toLocaleString("en-IN");
}
// Status helper
function show(msg, type) {
    const status = document.getElementById("status");
    status.textContent = msg;
    status.className = "status " + type;
}


