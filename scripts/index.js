const token = sessionStorage.getItem("token");
const username = sessionStorage.getItem("username");
if(token == null || username == null) {
    window.location.href = "login.html";
}
let info,
  id,
  subjects = {},
  grades = [];
let isLoaded = false;
id = get_id();
console.log(id)


fetch("https://aplikace.skolaonline.cz/SOLWebApi/api/v1/Predmety", {
  headers: {
    base64: "1",
    Authorization: "Basic " + token
  },
})
  .then((response) => response.json())
  .then((data) => {
    data["Data"].forEach((subject) => {
      const name = subject.NAZEV;
      const subject_id = subject.PREDMET_ID;
      const short = subject.ZKRATKA;
      subjects[subject_id] = { name: name, short: short, grades: [] };
    });
  })
  console.log(subjects)

async function get_id() {
    let res = await fetch("https://aplikace.skolaonline.cz/SOLWebApi/api/v1/UzivatelInfo", {
        method: "POST",
        headers: {
            base64: "1",
            Authorization: "Basic " + token,
            "Content-Type": "application/json; charset=utf-8",
            Accept: "application/json",
        },
        body: '"' + username + '"'
    })
    res = await res.json()
    res = res.Data.OSOBA_ID
    return res
}

