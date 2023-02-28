function login() {
  const username = btoa(to_binary($("#username").val()));
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
function to_binary(string) {
  const codeUnits = Uint16Array.from(
    { length: string.length },
    (element, index) => string.charCodeAt(index)
  );
  const charCodes = new Uint8Array(codeUnits.buffer);

  let result = "";
  charCodes.forEach((char) => {
    result += String.fromCharCode(char);
  });
  return result;
}