window.goBack = function () {
    location.replace("khata.html");
};

const data = JSON.parse(localStorage.getItem("editCustomer"));

if (!data) {
    alert("No customer selected");
    location.href = "khata.html";
} else {
    document.getElementById("custName").value = data.name || "";
    if (data.mobile && data.mobile.length === 10) {

        document.getElementById("mobile").value = data.mobile;
    }
    document.getElementById("address").value = data.address || "";

    console.log("Loaded Customer for Edit:", data);
}

const name = document.getElementById("custName");
const mobile = document.getElementById("mobile");
const address = document.getElementById("address");
const status = document.getElementById("status");

mobile.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
});


window.saveChanges = function () {
    const data = JSON.parse(localStorage.getItem("editCustomer"));
    const name = document.getElementById("custName").value;
    const mobile = document.getElementById("mobile").value;
    const address = document.getElementById("address").value;
    const status = document.getElementById("status");

    if (!name){
        show("Name required");
        return;
    }

    if (mobile && !/^\d{10}$/.test(mobile)) {
        show("Invalid mobile number");
        return;
    }



    const payload = {
        key: SECRET_KEY,
        action: "editCustomer",
        shopId: localStorage.getItem("shopId"),
        customerId: data.id,   // 🔥 এটা নতুন
        name: name,
        mobile: mobile,
        address: address
    };


    status.style.color = "#2563eb";
    status.textContent = "Saving...";

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
    })
        .then(r => r.json())
        .then(res => {

            if (res.status === "OK") {
                show("Changes saved", "ok");

               location.href = "khata.html";
            } else {
                show(res.message || "Error");
            }

        })
        .catch(() => {
            show("Network error");
        });
};

window.deleteCustomer = function () {

    const customer = JSON.parse(localStorage.getItem("editCustomer"));
    const shopId = localStorage.getItem("shopId");

    if (!confirm("Delete this customer?")) return;

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            key: SECRET_KEY,
            action: "deleteCustomer",
            shopId: shopId,
            customerId: customer.id
        })
    })
    .then(res => res.json())
    .then(res => {

        if(res.status === "OK"){

            show("Customer deleted", "ok");

            setTimeout(()=>{
                location.href = "khata.html";
            },800);

        }else{
            show("Delete failed");
        }

    })
    .catch(()=>{
        show("Network error");
    });
};

function show(msg, type = "error") {

    const status = document.getElementById("status");

    status.textContent = msg;

    if(type === "ok"){
        status.style.color = "#16a34a";
    }else{
        status.style.color = "#dc2626";
    }
}