const token = sessionStorage.getItem("token");
const username = sessionStorage.getItem("username");
if(token || username) {
    window.location.href = "calculator.html";
}
else {
    window.location.href = "login.html";
}

