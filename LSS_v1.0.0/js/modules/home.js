import {
    getRam,
    setRam,
    getLocal,
    setLocal
} from "../engine/cache-engine.js"

window.goQuickSale = () => {
    location.href = "quick-sale.html"
}

window.goKhata = () => {
    location.href = "khata.html"
}

window.goHistory = () => {
    location.href = "history.html"
}

window.goReports = () => {
    location.href = "reports.html"
}

window.goSettings = () => {
    location.href = "settings.html"
}

function loadSummaryFromCache() {

    const ram = getRam("summaryCache")

    if (ram) {
        updateSummaryUI(ram)
        return true
    }

    const local = getLocal("summaryCache")

    if (local) {
        updateSummaryUI(local)
        return true
    }

    return false
}

// AUTO RUN

if (!loadSummaryFromCache()) {
    loadHomeSummary()
} else {
    loadHomeSummary()   // background refresh
}

function loadHomeSummary() {

    console.log("START API")

    const shopId = getShopId();
    console.log("shopId:", shopId)

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

        console.log("API result:", res)

        updateSummaryUI(res)

        setRam("summaryCache", res)
        setLocal("summaryCache", res)

    })
    .catch(err => {
        console.error("API error:", err)
    })
}

function updateSummaryUI(res) {

    document.getElementById("sumTotal").textContent =
        Number(res.total).toLocaleString("en-IN")

    document.getElementById("boxTotal").textContent =
        Number(res.today).toLocaleString("en-IN")

    document.getElementById("boxCash").textContent =
        Number(res.cash).toLocaleString("en-IN")

    document.getElementById("boxDue").textContent =
        Number(res.due).toLocaleString("en-IN")

}

