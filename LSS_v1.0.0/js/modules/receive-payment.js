// ===== Receive Payment Page Logic =====

// Navigation
window.goBack = function () {
    location.replace("khata.html");
};
// ===== Initialize Page (Module Safe) =====

const data = JSON.parse(localStorage.getItem("payCustomer"));

let previousDue = 0;

if (!data) {
    alert("No customer selected");
    location.href = "khata.html";
} else {

    previousDue = Number(data.due) || 0;

    document.getElementById("custName").textContent = data.name;
    document.getElementById("lastUpdateTime").textContent = data.lastUpdateTime;
    console.log("Loaded Customer for Payment:", data);

    const headerDueEl = document.getElementById("headerDue");
    const prevDueEl = document.getElementById("prevDueText");


    if (previousDue < 0) {
        headerDueEl.textContent = "₹ " + Math.abs(previousDue).toLocaleString() + " Advance";
        headerDueEl.style.color = "#16a34a";
    } else if (previousDue > 0) {
        headerDueEl.textContent =
            "₹ " + previousDue.toLocaleString() + " Due";
        headerDueEl.style.color = "#dc2626";
    } else {
        headerDueEl.textContent = "₹ 0";
        headerDueEl.style.color = "#000";
    }
}



// Elements
const saleEl = document.getElementById("sale");
const receivedEl = document.getElementById("payment");

// Init
window.addEventListener("DOMContentLoaded", () => {
    updateRemain();
});



// Live calculation
// saleEl.addEventListener("input", updateRemain);
receivedEl.addEventListener("input", updateRemain);

// document.getElementById("allowAdvance")
//     .addEventListener("change", updateRemain);

function num(v) {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
}

function updateRemain() {
    // const s = num(saleEl.value);
    const r = num(receivedEl.value);
    const remain = previousDue - r;

    const remainEl = document.getElementById("remain");
    const labelEl = document.getElementById("remainLabel");
    const allowAdvance = document.getElementById("allowAdvance").checked;

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

window.confirmPayment = function () {

    const payEl = document.getElementById("payment");
    const amount = num(payEl.value);
    const paymentData = JSON.parse(localStorage.getItem("payCustomer"));
    const newDue = previousDue - amount;
    // const allowAdvance = document.getElementById("allowAdvance").checked;

    if (amount === 0) {
        show("Enter payment amount");
        return;
    }

    if (newDue < 0 && !false) {  // Advance option Off
        show("Amount exceeds pending due. Enable Advance to continue.");
        return;
    }

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

                setTimeout(() => {
                    location.replace("khata.html");
                }, 600);
                
            } else {
                document.getElementById("status").innerText = "Payment failed. Please try again.";
            }

        })
        .catch(err => {
            alert("Network Error");
            console.error(err);
        });
}
// Helpers
function fmt(n) {
    return n.toLocaleString("en-IN");
}
function show(msg, type) {
    const status = document.getElementById("status");
    status.textContent = msg;
    status.className = "status " + type;
}