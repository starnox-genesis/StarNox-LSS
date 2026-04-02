// import Chart from "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js";

window.goBack = function () {
    location.href = "home.html";
};

let memoryReportsCache = null;
let reportsLastFetch = 0;

let historyData = [];
let khataData = [];

let activeRange = "today";

let chartInstance = null;

function loadReportsFromCache() {

    if (memoryReportsCache) {
        renderReports(memoryReportsCache);
        return true;
    }

    const raw = localStorage.getItem("reportsCache");

    if (!raw) return false;

    let cache;

    try {
        cache = JSON.parse(raw);
    } catch {
        return false;
    }

    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    if (now - cache.time > ONE_DAY) return false;

    memoryReportsCache = cache.data;

    renderReports(cache.data);

    return true;
}

function filterHistoryByRange(history) {

    if (!Array.isArray(history)) {
        history = history.data || [];
    }

    const today = new Date();

    return history.filter(item => {

        const d = new Date(item.date);

        if (activeRange === "today") {
            return d.toDateString() === today.toDateString();
        }

        if (activeRange === "week") {
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);
            return d >= weekAgo;
        }

        if (activeRange === "month") {
            const monthAgo = new Date();
            monthAgo.setDate(today.getDate() - 30);
            return d >= monthAgo;
        }

        return true;

    });

}

async function loadReports() {

    const now = Date.now();

    if (now - reportsLastFetch < 5000) return;

    reportsLastFetch = now;

    const shopId = getShopId();

    try {

        const historyRes = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                key: SECRET_KEY,
                action: "getHistory",
                shopId: shopId
            })
        });

        const khataRes = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                key: SECRET_KEY,
                action: "getKhataList",
                shopId: shopId
            })
        });

        const historyJson = await historyRes.json();
        historyData = historyJson.data || historyJson;

        const khataJson = await khataRes.json();
        khataData = khataJson.data || khataJson;

        const reportData = {
            history: historyData,
            khata: khataData
        };

        memoryReportsCache = reportData;

        localStorage.setItem("reportsCache", JSON.stringify({
            data: reportData,
            time: Date.now()
        }));

        renderReports(reportData);

    } catch (err) {
        console.error("Reports API error:", err);
    }

}

// Main Render Function
function renderReports(data) {

    const history = Array.isArray(data.history) ? data.history : data.history.data || [];
    const khata = Array.isArray(data.khata) ? data.khata : data.khata.data || [];

    const filteredHistory = filterHistoryByRange(history);

    const summary = calculateSummary(filteredHistory, khata);

    document.getElementById("totalSale").textContent =
        "₹" + summary.totalSale.toLocaleString("en-IN");

    document.getElementById("totalCash").textContent =
        "₹" + summary.totalReceived.toLocaleString("en-IN");

    document.getElementById("totalDue").textContent =
        "₹" + summary.totalDue.toLocaleString("en-IN");

    const trend = calculateTrend(filteredHistory);

    loadChart(trend);

    const topCustomers = getTopCustomers(khata);

    renderCustomers(topCustomers);
}

function loadChart(trend) {

    const ctx = document.getElementById("chart");

    if (!ctx) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [{
                data: trend,
                borderColor: "#4aa3b5",
                backgroundColor: "rgba(74,163,181,0.2)",
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

}

// Load History & Khata for Reports Page Calculations
function calculateSummary(history, khata) {

    let totalSale = 0;
    let totalReceived = 0;
    let totalDue = 0;

    history.forEach(item => {
        totalSale += Number(item.sale) || 0;
        totalReceived += Number(item.received) || 0;
    });

    khata.forEach(c => {
        if (Number(c.due) > 0) {
            totalDue += Number(c.due);
        }
    });

    return { totalSale, totalReceived, totalDue };

}

function calculateTrend(history) {

    const trend = [0,0,0,0,0,0,0];

    history.forEach(item => {

        const d = new Date(item.date);

        let day = d.getDay();

        // convert Sunday=0 → 6
        day = (day + 6) % 7;

        trend[day] += Number(item.sale) || 0;

    });

    return trend;
}

function getTopCustomers(khata) {

    return khata
        .filter(c => Number(c.due) > 0)
        .sort((a, b) => b.due - a.due)
        .slice(0, 5);

}

function renderCustomers(list) {

    const container = document.getElementById("topCustomers");

    if (!container) return;

    container.innerHTML = "";

    list.forEach(c => {

        const initials = c.name
            .split(" ")
            .map(n => n[0])
            .join("");

        container.innerHTML += `
        <div class="customer">
            <div class="row">
                <div class="avatar">${initials}</div>
                ${c.name}
            </div>
            <div class="due">₹${Number(c.due).toLocaleString("en-IN")}</div>
        </div>
        `;
    });
}



loadReportsFromCache();
loadReports();
