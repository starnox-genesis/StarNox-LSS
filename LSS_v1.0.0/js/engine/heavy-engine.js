// ===== StarNox LSS Core Engine =====

export async function fetchData(action, options = {}) {

    const {
        loaderId = "loader",
        cacheTime = 24 * 60 * 60 * 1000
    } = options;

    const loader = document.getElementById(loaderId);

    const shopId = localStorage.getItem("shopId");

    const cacheKey = action + "_cache";

    // ===== Cache Check =====
    const raw = localStorage.getItem(cacheKey);

    if (raw) {

        const cache = JSON.parse(raw);

        const age = Date.now() - cache.time;

        if (age < cacheTime) {

            if (loader) loader.style.display = "none";

            return cache.data;

        }
    }

    // ===== Show Loader =====
    if (loader) loader.style.display = "block";

    try {

        const res = await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify({
                key: SECRET_KEY,
                action: action,
                shopId: shopId
            })
        });

        const data = await res.json();

        const list = data.data || [];

        // ===== Save Cache =====
        localStorage.setItem(cacheKey, JSON.stringify({
            data: list,
            time: Date.now()
        }));

        return list;

    } catch (err) {

        console.error("API Error:", err);

        return [];

    } finally {

        // ===== Hide Loader =====
        if (loader) loader.style.display = "none";

    }

}