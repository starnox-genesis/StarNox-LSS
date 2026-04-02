// Navigation
window.goBack = function () {
    history.back();
};

// Update Password
window.updatePassword = function () {

    const cur = document.getElementById("current").value;
    const np = document.getElementById("newp").value;
    const cp = document.getElementById("conf").value;
    const status = document.getElementById("status");

    if (!cur || !np || !cp) {
        show("Fill all fields", "error");
        return;
    }

    if (np.length < 4) {
        show("New password too short", "error");
        return;
    }

    if (np !== cp) {
        show("Passwords do not match", "error");
        return;
    }

    // Current password check (localStorage)
 status.textContent = "Updating...";
status.className = "status";

fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
        key: SECRET_KEY,
        action: "changePassword",
        shopId: localStorage.getItem("shopId"),
        currentPassword: cur,
        newPassword: np
    })
})
.then(res => res.json())
.then(res => {

    if (res.status === "success") {
        show("Password updated successfully", "success");
        clearFields();
    } else {
        show(res.message || "Update failed", "error");
    }

})
.catch(() => {
    show("Network error", "error");
});

};

// Helpers
function show(msg, type) {
    const status = document.getElementById("status");
    status.textContent = msg;
    status.className = "status " + type;
}

function clearFields() {
    document.getElementById("current").value = "";
    document.getElementById("newp").value = "";
    document.getElementById("conf").value = "";
}
