// ===== Global Config =====
window.API_URL = "https://script.google.com/macros/s/AKfycbyYBMjUIYROjNMtQVNopj2nDhoI_tMCOqAi29kjfH9PqGL9supSPA2j_8jW_v451X5_/exec";

window.SECRET_KEY = "STARNOX123";

const page = document.body.dataset.page;
const token = localStorage.getItem("authToken");

// Allowed without login
const publicPages = ["login", "signup"];

// Not logged in → block other pages
if (!token && !publicPages.includes(page)) {
    location.href = "login.html";
}

// Already logged → block login/signup
if (token && publicPages.includes(page)) {
    location.href = "home.html";
}

// Load page logic
if (page) {
    import(`./modules/${page}.js`)
        .then(() => console.log(page + " logic loaded"))
        .catch(err => console.error("Module load error:", err));
}

// Load PWA install logic on relevant pages
if (page === "home" || page === "login") {
    import("./engine/pwa-install.js")
        .then(() => console.log("PWA install logic loaded"))
        .catch(err => console.error("PWA Module load error:", err));
}

// ===== Common Session Helper =====
window.getShopId = function () {
    const id = localStorage.getItem("shopId");

    if (!id) {
        alert("Session expired. Please login again.");
        location.href = "login.html";
        return "";
    }

    return id;
};

