// Navigation
window.goBack = function () {
    history.back();
}

// Load profile on page load
function loadProfile(){

    const shopId = localStorage.getItem("shopId");
    const loader = document.getElementById("loader");

    loader.style.display = "block";

    fetch(API_URL,{
        method:"POST",
        body:JSON.stringify({
            key: SECRET_KEY,
            action: "getProfile",
            shopId: shopId
        })
    })
    .then(res => res.json())
    .then(res => {

        loader.style.display = "none";

        if(res.status === "success"){

            document.getElementById("shopName").textContent = res.shopName;
            document.getElementById("ownerName").textContent = res.ownerName;
            document.getElementById("shopId").textContent = res.shopId;
            document.getElementById("shopMobile").textContent = res.mobile;

        } else {
            alert("Profile load failed");
        }
    })
    .catch(err => {
        loader.style.display = "none";
        console.error(err);
    });
}

// Auto run
loadProfile();

// Actions
window.changePassword = function () {
    location.href = "change-password.html";
}

window.logout = function () {

    // if (!confirm("Logout from this device?")) return;

    localStorage.removeItem("shopId");
    localStorage.removeItem("authToken");

    console.log("Logged out");

    location.href = "login.html";
}

// Backend bind
window.setProfile = function (p) {
    document.getElementById("shopName").textContent = p.shopName;
    document.getElementById("ownerName").textContent = p.owner;
    document.getElementById("shopId").textContent = p.shopId;
    document.getElementById("shopMobile").textContent = p.mobile;
}
