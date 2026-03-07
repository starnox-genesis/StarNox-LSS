// Navigation
window.goBack = function () {
    history.back();
}

window.openFilter = function () {
    alert("Filter option (date / customer)");
}
// ===== History Page Logic =====
function loadHistory() {

    const shopId = getShopId();
    if (!shopId) return;

    const loader = document.getElementById("loader");
    const container = document.getElementById("historyList");

    loader.style.display = "block";
    container.innerHTML = "";

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            key: SECRET_KEY,
            action: "getHistory",
            shopId: shopId
        })
    })
    .then(res => res.json())
    .then(res => {

        loader.style.display = "none";

        if (res.status !== "success") {
            container.innerHTML = "<p>Failed to load</p>";
            return;
        }

        renderHistory(res.data);

    })
    .catch(err => {
        loader.style.display = "none";
        container.innerHTML = "<p>Error loading data</p>";
        console.error(err);
    });
}


function renderHistory(list) {

    const container = document.getElementById("historyList");
    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = "<p>No records</p>";
        return;
    }

    list.forEach(item => {
        const due = item.totalDueAfter;

        let dueText = "";
        let dueColor = "";
        let dueBold = "";

        if (due < 0) {
            dueText = "Advance: ₹" + Math.abs(due).toLocaleString("en-IN")+ " ";
            dueColor = "green";
            dueBold = "bold";

        } else if (due > 0) {
            dueText = "Due: ₹" + due.toLocaleString("en-IN") + " ";
            dueColor = "red";
            dueBold = "bold";
        } else {
            dueText = "Remaning: ₹0";
            dueColor = "gray";
            dueBold = "bold";
        }

        container.innerHTML += `
<div class="history-item">
    <div class="history-left">
        <div class="history-name">${item.name}</div>
        <div class="history-date">${item.date}</div>
        <div class="history-date">${item.type}</div>
    </div>

    <div class="history-right">
        <div>Sale: ₹${item.sale}</div>
        <div class="green">Received: ₹${item.received}</div>
        <div class="history-due" style="color: ${dueColor}; font-weight: ${dueBold}">${dueText}</div>
    </div>
</div>
`;

    });
}

// Auto run
loadHistory();
