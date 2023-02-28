function login() {
  const username = utf8_to_b64($("#username").val());
  const password = btoa($("#password").val());
  const token = btoa(username + ":" + password);
  fetch(
    "https://aplikace.skolaonline.cz/SOLWEBApi/api/v1/AuthorizationStatus",
    {
      headers: {
        base64: "1",
        Authorization: "Basic " + token,
      }
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.Status.Code == "OK") {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("username", username);
        window.location.href = "calculator.html";
      } else {
        alert("Incorrect username or password.");
      }
    });
}
function utf8_to_b64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}