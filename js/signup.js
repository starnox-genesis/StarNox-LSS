// Navigation
window.goBack = function () {
    history.back();
};

window.goLogin = function () {
    location.href = "login.html";
};

// Validation
function validMobile(m) {
    return /^[6-9]\d{9}$/.test(m);
}

// Signup
window.signupBtn = function () {

    const shop = document.getElementById("shop").value.trim();
    const owner = document.getElementById("owner").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const pass = document.getElementById("pass").value;
    const cpass = document.getElementById("cpass").value;
    const status = document.getElementById("status");

    if (!shop || !owner || !mobile || !pass || !cpass) {
        show("Fill all fields");
        return;
    }

    if (!validMobile(mobile)) {
        show("Enter valid 10-digit mobile");
        return;
    }

    if (pass.length < 4) {
        show("Password too short");
        return;
    }

    if (pass !== cpass) {
        show("Passwords do not match");
        return;
    }

    status.style.color = "#2563eb";
    status.textContent = "Creating account...";

    fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
        key: SECRET_KEY,
        action: "signup",
        shopName: shop,
        owner: owner,
        mobile: mobile,
        password: pass
    })
})
.then(res => res.json())
.then(data => {

    console.log("Signup response:", data);

    if (data.status === "success") {

        status.style.color = "#059669";
        status.textContent = "Account created";

        setTimeout(() => {
            location.href = "login.html";
        }, 800);

    } else {
        show(data.message || data.error || "Signup failed");
    }

})
.catch(err => {
    console.error("Fetch error:", err);
    show("Server connection error");
});
}

// Helper
function show(msg) {
    const status = document.getElementById("status");
    status.style.color = "#dc2626";
    status.textContent = msg;
}
