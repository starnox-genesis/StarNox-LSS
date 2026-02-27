let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installBtn = document.createElement("button");
    installBtn.innerText = "Install StarNox";
    installBtn.style.position = "fixed";
    installBtn.style.bottom = "20px";
    installBtn.style.right = "20px";
    installBtn.style.padding = "10px 15px";
    installBtn.style.background = "#2f6fb2";
    installBtn.style.color = "white";
    installBtn.style.border = "none";
    installBtn.style.borderRadius = "8px";
    installBtn.style.cursor = "pointer";
    installBtn.style.zIndex = "9999";

    document.body.appendChild(installBtn);

    installBtn.addEventListener("click", async () => {
        installBtn.remove();
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
    });
});

window.addEventListener("appinstalled", () => {
    console.log("App Installed");
});