// Back
window.goBack = function () {
    history.back();
}

// Quick Sale (No customer, no due, just sale and receive)
window.quickSaleConfirm = function () {

    const sale = Number(document.getElementById("amount").value) || 0;

    if (sale <= 0) {
        show("Enter valid amount", "error");
        return;
    }

    // console.log("QUICK SALE →", payload);
    show("Saving...", "");

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            key: SECRET_KEY,
            action: "QuickSale",
            shopId: getShopId(),

            customerId: "",
            customerName: "Cash Sale",
            phone: "",

            saleAmount: sale,
            receivedAmount: sale,
            due: 0,

            mode: "CASH",
            type: "SALE"
        })
    })
        .then(res => res.json())
        .then(res => {
            if (res.status === "OK") {
                show("Cash Sale Saved", "success");
                clearFields();
            } else {
                show(res.message || "Error saving sale", "error");
            }
        })
        .catch(err => console.error(err));
};
// Helpers
function show(msg, type) {
    const status = document.getElementById("status");
    status.textContent = msg;
    status.className = "status " + type;
}
// Clear inputs
function clearFields() {
    document.getElementById("amount").value = "";

}
