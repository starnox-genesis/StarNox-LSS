// Navigation
window.goBack = function () {
    history.back();
}

// ===== Cache =====
let memoryProfileCache = null;
let profileLastFetch = 0;


// ===== Load Profile =====
function loadProfile() {

    const shopId = localStorage.getItem("shopId");
    const loader = document.getElementById("loader");
    const content = document.getElementById("content");

    // ===== RAM Cache =====
    if (memoryProfileCache) {

        // Cache hit - show content immediately Disable loader
        loader.style.display = "none";
        content.style.display = "block";

        setProfile(memoryProfileCache);

        return;
    }

    // ===== LocalStorage Cache =====
    const raw = localStorage.getItem("profileCache");

    if (raw) {

        const cache = JSON.parse(raw);

        const age = Date.now() - cache.time;

        const ONE_DAY = 24 * 60 * 60 * 1000;

        if (age < ONE_DAY) {

            // Valid cache found - show content immediately Disable loader
            loader.style.display = "none";
            content.style.display = "block";

            memoryProfileCache = cache.data;

            setProfile(cache.data);

            return;
        }
    }

    // ===== API Debounce =====
    const now = Date.now();

    if (now - profileLastFetch < 5000) {
        return;
    }

    profileLastFetch = now;

    //Show loader before API call and hide content
    loader.style.display = "block";
    content.style.display = "none";

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            key: SECRET_KEY,
            action: "getProfile",
            shopId: shopId
        })
    })
        .then(res => res.json())
        .then(res => {

            // Hide loader and show content
            loader.style.display = "none";
            content.style.display = "block";

            if (res.status !== "success") {
                alert("Profile load failed");
                return;
            }

            const profile = {
                shopName: res.shopName,
                owner: res.ownerName,
                shopId: res.shopId,
                mobile: res.mobile
            };

            // ===== Cache save =====
            memoryProfileCache = profile;

            localStorage.setItem("profileCache", JSON.stringify({
                data: profile,
                time: Date.now()
            }));

            setProfile(profile);

        })
        .catch(err => {

            // Hide loader and show content (if API fails, user can still see cached data or empty state)
            loader.style.display = "none";
            content.style.display = "block";

            console.error(err);

        });
}


// ===== UI Bind =====
function setProfile(p) {

    document.getElementById("shopName").textContent = p.shopName;
    document.getElementById("ownerName").textContent = p.owner;
    document.getElementById("shopId").textContent = p.shopId;
    document.getElementById("shopMobile").textContent = p.mobile;

}


// ===== Auto run =====
loadProfile();


// ===== Actions =====
window.changePassword = function () {
    location.href = "change-password.html";
}

window.logout = function () {

    localStorage.removeItem("shopId");
    localStorage.removeItem("authToken");
    localStorage.removeItem("profileCache");

    location.href = "login.html";

}