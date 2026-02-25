// Help
window.openHelp = function () {
    alert("Support: contact admin");
}

// Social
window.googleLogin = function () {
    alert("Google login hook");
}

window.appleLogin = function () {
    alert("Apple login hook");
}

window.signup = function () {
    location.href = "signup.html";
}

// ===== Login =====
// ===== Login =====
window.login = function () {

    const user = document.getElementById("user").value.trim();
    const pass = document.getElementById("pass").value.trim();
    const statusEl = document.getElementById("status");

    if (!user || !pass) {
        show("Enter mobile and password");
        return;
    }

    statusEl.style.color = "#2563eb";
    statusEl.textContent = "Signing in...";

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            key: SECRET_KEY,
            action: "login",
            mobile: user,
            password: pass
        })
    })
    .then(res => res.json())
    .then(data => {

        // Backend response check
        if (data.status === "success") {

            localStorage.setItem("authToken", "ok");
            localStorage.setItem("shopId", data.shopId);
            localStorage.setItem("shopName", data.shopName);

            statusEl.style.color = "#059669";
            statusEl.textContent = "Login successful";

            location.href = "home.html";

        } else {
            show(data.message || "Login failed");
        }

    })
    .catch(() => {
        show("Server connection error");
    });
};



// ===== Helper =====
function show(msg) {
    const status = document.getElementById("status");
    status.style.color = "#dc2626";
    status.textContent = msg;
}
