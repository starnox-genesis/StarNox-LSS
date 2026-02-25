// ===== Receive Payment Page Logic =====

// Navigation
window.goBack = function () {
    history.back();
};

let previousDue = 0;

// ===== Initialize Page (Module Safe) =====

const data = JSON.parse(localStorage.getItem("payCustomer"));

if (!data) {
    alert("No customer selected");
    location.href = "khata.html";
} else {

    previousDue = Number(data.due) || 0;

    // Set customer info
    const nameEl = document.getElementById("custName");
    const dueEl = document.getElementById("headerDue");

    if (nameEl) nameEl.textContent = data.name;
    if (dueEl) dueEl.textContent = previousDue.toLocaleString("en-IN");

    const payEl = document.getElementById("amt");

    if (payEl) {
        payEl.addEventListener("input", updateRemain);
    }

    updateRemain();
}


// ===== Helpers =====

function num(v) {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
}


// ===== Live Remaining Calculation =====

function updateRemain() {

    const payEl = document.getElementById("amt");
    const remainEl = document.getElementById("remain");

    if (!payEl || !remainEl) return;

    const paid = num(payEl.value);
    const remain = previousDue - paid;

    // Color logic
    if (remain < 0) {
        remainEl.style.color = "#16a34a";   // red
    } else if (remain === 0) {
        remainEl.style.color = "#2563eb";   // blue
    } else {
        remainEl.style.color = "#dc2626";   // green
    }

    remainEl.textContent = remain.toLocaleString("en-IN");
}

window.confirmPayment = function() {
    
    const payEl = document.getElementById("amt");
    const amount = num(payEl.value);

    if (amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    if (amount > previousDue) {
        alert("Amount exceeds pending due");
        return;
    }

    const paymentData = JSON.parse(localStorage.getItem("payCustomer"));

    if (!paymentData) {
        alert("No customer selected");
        location.href = "khata.html";
        return;
    }

    const newDue = previousDue - amount;

    const payload = {
        key: SECRET_KEY,
        action: "payBill",
        shopId: localStorage.getItem("shopId"),
        customerId: paymentData.id,
        customerName: paymentData.name,
        amount: amount,
        due: newDue
    };

    console.log("PAYMENT BILL →", payload);

    show("Updating...", "");

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(res => {
        console.log("Server Response:", res);

        if (res.status === "OK") {
            document.getElementById("status").innerText = "Payment recorded successfully";
            location.href = "khata.html";
        } else {
            document.getElementById("status").innerText = "Payment failed. Please try again.";
        }

    })
    .catch(err => {
        alert("Network Error");
        console.error(err);
    });
}

function show(msg, type) {
    const status = document.getElementById("status");
    status.textContent = msg;
    status.className = "status " + type;
}