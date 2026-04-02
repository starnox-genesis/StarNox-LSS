// Navigation
window.goBack = function () {
    location.replace("khata.html");
};
// Load customer from khata
const data = JSON.parse(localStorage.getItem("updateCustomer"));

let previousDue = 0;

if (!data) {
    alert("No customer selected");
    location.href = "khata.html";
} else {

    previousDue = Number(data.due) || 0;

    document.getElementById("custName").textContent = data.name;
    document.getElementById("lastUpdateTime").textContent = data.lastUpdateTime;
    console.log("Loaded Customer for Update:", data);

    const headerDueEl = document.getElementById("headerDue");



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
const receivedEl = document.getElementById("received");

// Init
window.addEventListener("DOMContentLoaded", () => {
    updateRemain();
});



// Live calculation
saleEl.addEventListener("input", updateRemain);
receivedEl.addEventListener("input", updateRemain);

// document.getElementById("allowAdvance")
//     .addEventListener("change", updateRemain);

function num(v) {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
}

function updateRemain() {
    const s = num(saleEl.value);
    const r = num(receivedEl.value);
    const remain = previousDue + s - r;

    const remainEl = document.getElementById("remain");
    const labelEl = document.getElementById("remainLabel");
    // const allowAdvance = document.getElementById("allowAdvance").checked;

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
//@ts-nocheck
// Confirm update
window.confirmUpdate = function () {

    

    const sale = Number(saleEl.value) || 0;
    const received = Number(receivedEl.value) || 0;
    const updateData = JSON.parse(localStorage.getItem("updateCustomer"));
    const newDue = previousDue + sale - received;
    // const allowAdvance = document.getElementById("allowAdvance").checked;

    if (sale === 0 && received === 0) {
        show("Enter Sale or Payment amount");
        return;
    }

    if (newDue < 0 && !false) {
        show("Amount exceeds pending due. Enable Advance to continue.");
        return;
    }

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

                // 🔥 clear khata cache 
                // localStorage.removeItem("khataCache");

                setTimeout(() => {
                    location.replace("khata.html");
                }, 600);
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
