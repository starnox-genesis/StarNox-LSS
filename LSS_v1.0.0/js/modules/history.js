/* ======= Import Engine ======= */

import {
    getRam,
    setRam,
    getLocal,
    setLocal
} from "../engine/cache-engine.js"

import { renderList } from "../engine/render-engine.js"

/*====== Navigation ====== */

window.goBack = function () {
    history.back();
}
window.openFilter = function () {
    alert("Filter option (date / customer)");
}

// ===== Cache System =====
let memoryHistoryCache = null;
let historyLastFetch = 0;

let allHistory = [];
let visibleHistory = 20;
let activeHistory = [];

//3️⃣ Lightweight Virtual DOM Pattern (Pure JS)
let historyState = [];

/** == NEW: render engine এই template ব্যবহার করবে ==**/
function historyTemplate(item) {

    const due = Number(item.totalDueAfter) || 0

    let dueText = ""
    let dueColor = ""

    if (due < 0) {
        dueText = "Advance: ₹" + Math.abs(due).toLocaleString("en-IN")
        dueColor = "green"
    }
    else if (due > 0) {
        dueText = "Due: ₹" + due.toLocaleString("en-IN")
        dueColor = "red"
    }
    else {
        dueText = "Remaining: ₹0"
        dueColor = "gray"
    }

    return `

            <div class="history-item">

            <div class="history-left">
            <div class="history-name">${item.name}</div>
            <div class="history-date">${item.date}</div>
            <div class="history-date">${item.type}</div>
            </div>

            <div class="history-right">
            <div>Sale: ₹${item.sale}</div>
            <div class="green">Received: ₹${item.received}</div>
            <div class="history-due" style="color:${dueColor}">
            ${dueText}
            </div>
            </div>

            </div>`

}

/*== First Load || Cache Loader ==*/

function loadHistoryFromCache() {

    const ram = getRam("historyCache");

    if (ram) {
        updateHistoryUI(ram);
        return true;
    }

    const local = getLocal("historyCache");

    if (local) {
        updateHistoryUI(local);
        return true;
    }

    return false;
}

function updateHistoryUI(data) {

    const loader = document.getElementById("loader")
    if (loader) loader.style.display = "none"

    allHistory = data
    activeHistory = data
    visibleHistory = 20

    // NEW: render engine ব্যবহার হচ্ছে
    renderList("historyList", activeHistory, historyTemplate, visibleHistory)

}

// Auto run
if (!loadHistoryFromCache()) {
    loadHistory();
} else {
    loadHistory(); // Background update for fresh data
}

/* ===== Api Call || History Page Logic ===== */
function loadHistory() {

    console.log("START API")

    const shopId = getShopId();
    console.log("shopId:", shopId)
    if (!shopId) return;

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

            console.log("API result:", res)

            if (res.status !== "success") return;

            const list = res.data || []

            // NEW: data আসার পর sort করা হচ্ছে date অনুযায়ী (newest first)
            list.sort((a, b) => new Date(b.date) - new Date(a.date))

            updateHistoryUI(list)

            setRam("historyCache", list)
            setLocal("historyCache", list)

        })
        .catch(err => {
            console.error(err)
        })

}


// ===== Render History =====
function renderHistory(list) {

    const container = document.getElementById("historyList")

    if (!Array.isArray(list) || list.length === 0) {
        container.innerHTML = "<p>No records</p>"
        return
    }

    container.innerHTML = ""   // full clear

    renderHistoryVirtual(list)

}



// ===== Search & Infinite Scroll =====

let searchTimer

window.searchHistoryList = function () {

    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {

        const q = document
            .getElementById("searchInput")
            .value
            .trim()
            .toLowerCase();

        visibleHistory = 20;

        if (!q) {
            activeHistory = allHistory;
            renderList("historyList", activeHistory, historyTemplate, visibleHistory)
            return;
        }

        const filtered = allHistory.filter(item =>
            (item.name && item.name.toLowerCase().includes(q)) ||
            (item.type && item.type.toLowerCase().includes(q))
        );

        activeHistory = filtered;

        renderList("historyList", activeHistory, historyTemplate, visibleHistory)

    }, 200);

};

/* ===== Infinite Scroll ===== */
window.addEventListener("scroll", function () {

    const scrollTop = window.scrollY
    const windowHeight = window.innerHeight
    const pageHeight = document.body.offsetHeight

    if (scrollTop + windowHeight >= pageHeight - 100) {

        if (visibleHistory >= activeHistory.length) return

        visibleHistory += 20

        // NEW: render engine ব্যবহার হচ্ছে
        renderList("historyList", activeHistory, historyTemplate, visibleHistory)

    }

})

function renderHistoryVirtual(list) {

    const container = document.getElementById("historyList")

    const fragment = document.createDocumentFragment()

    list.slice(0, visibleHistory).forEach(item => {

        const card = document.createElement("div")
        card.className = "history-item"
        card.id = "history-" + item.id

        const due = Number(item.totalDueAfter) || 0

        let dueText = ""
        let dueColor = ""

        if (due < 0) {
            dueText = "Advance: ₹" + Math.abs(due).toLocaleString("en-IN")
            dueColor = "green"
        }
        else if (due > 0) {
            dueText = "Due: ₹" + due.toLocaleString("en-IN")
            dueColor = "red"
        }
        else {
            dueText = "Remaining: ₹0"
            dueColor = "gray"
        }

        card.innerHTML = `
<div class="history-left">
<div class="history-name">${item.name}</div>
<div class="history-date">${item.date}</div>
<div class="history-date">${item.type}</div>
</div>

<div class="history-right">
<div>Sale: ₹${item.sale}</div>
<div class="green">Received: ₹${item.received}</div>
<div class="history-due" style="color:${dueColor}">
${dueText}
</div>
</div>
`

        fragment.appendChild(card)

    })

    container.appendChild(fragment)

}


function updateHistoryCard(item) {

    const card = document.getElementById("history-" + item.id)

    if (!card) return

    const dueBox = card.querySelector(".history-due")

    const due = Number(item.totalDueAfter) || 0

    let text = ""
    let color = ""

    if (due < 0) {
        text = "Advance: ₹" + Math.abs(due).toLocaleString("en-IN")
        color = "green"
    }
    else if (due > 0) {
        text = "Due: ₹" + due.toLocaleString("en-IN")
        color = "red"
    }
    else {
        text = "Remaining: ₹0"
        color = "gray"
    }

    dueBox.textContent = text
    dueBox.style.color = color

}

