// Navigation

window.goQuickSale = function () {
    location.href = "quick-sale.html";
    // location.href = "quick-sale.html";
}

window.goKhata = function () {
    location.href = "khata.html";
}

window.goHistory = function () {
    location.href = "history.html";
}

window.goSettings = function () {
    location.href = "settings.html";
}


// Summary Update Function

/* =========================
   HOME – Today Summary
========================= */

function loadHomeSummary() {

    const shopId = getShopId();
    if (!shopId) return;

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            key: SECRET_KEY,
            action: "getToday",
            shopId: shopId
        })
    })
        .then(res => res.json())
        .then(res => {

            if (res.status !== "success") return;

            document.getElementById("sumTotal").textContent = formatMoney(res.total);
            document.getElementById("boxTotal").textContent = formatMoney(res.today);
            document.getElementById("boxCash").textContent = formatMoney(res.cash);
            document.getElementById("boxDue").textContent = formatMoney(res.due);

        })
        .catch(err => console.error(err));
}

function formatMoney(n) {
    return Number(n).toLocaleString("en-IN");
}

// Auto run when page loads
loadHomeSummary();
