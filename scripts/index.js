const token = sessionStorage.getItem("token");
const username = sessionStorage.getItem("username");
if (token == null || username == null) {
  window.location.href = "login.html";
}
let info, id, subjects, grades;

init_data().then(() => load_page());

async function init_data() {
  id = await fetch_id();
  subjects = await fetch_subjects();
  info = await fetch_user_info();
  grades = await fetch_grades();
}

this.addEventListener("keypress", (event) => {
  if (event.keyCode == 13) {
    refresh_grades();
  }
});

function refresh_grades() {}

function load_page() {
  console.log(subjects);
  let table = document.getElementById("grades");
  grades.forEach((grade) => console.log(grade.Name));
  let grades_from_subject = get_grades_from_subject("");
  grades.forEach((grade) => {
    let row = table.insertRow();
    let name_cell = row.insertCell(0);
    let grade_cell = row.insertCell(1);
    name_cell.innerHTML = grade.Name;
    grade_cell.outerHTML = `<input type="text" id="${grade.ID}" placeholder="${grade.Grade}"></td>`;
  });
}

function get_grades_from_subject(subject_id) {
  grades_from_subject = [];
  grades.forEach((grade) => {
    if (grade.Subject == subject_id) {
      grades_from_subject.push(grade);
    }
  });
  return grades_from_subject;
}

async function fetch_id() {
  let res = await fetch(
    "https://aplikace.skolaonline.cz/SOLWebApi/api/v1/UzivatelInfo",
    {
      method: "POST",
      headers: {
        base64: "1",
        Authorization: "Basic " + token,
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
      },
      body: '"' + username + '"',
    }
  );
  res = await res.json();
  res = res.Data.OSOBA_ID;
  return res;
}

async function fetch_user_info() {
  let res = await fetch(
    "https://aplikace.skolaonline.cz/SOLWebApi/api/v1/UzivatelInfo",
    {
      method: "POST",
      headers: {
        base64: "1",
        Authorization: "Basic " + token,
        "Content-Type": "application/json; charset=utf-8",
        Accept: "application/json",
      },
      body: '"' + username + '"',
    }
  );
  res = await res.json();
  res = res.Data;
  return res;
}

async function fetch_subjects() {
  let res = await fetch(
    "https://aplikace.skolaonline.cz/SOLWebApi/api/v1/Predmety",
    {
      headers: {
        base64: "1",
        Authorization: "Basic " + token,
      },
    }
  );
  res = await res.json();
  let subs = {};
  res.Data.forEach((subject) => {
    const name = subject.NAZEV;
    const subject_id = subject.PREDMET_ID;
    const short = subject.ZKRATKA;
    let sub_grades;
    subs[subject_id] = { Name: name, Short: short };
  });
  return subs;
}

async function fetch_grades() {
  let res = await fetch(
    `https://aplikace.skolaonline.cz/SOLWebApi/api/v1/VypisHodnoceniStudent?studentId=${id}`,
    {
      headers: {
        base64: "1",
        Authorization: "Basic " + token,
      },
    }
  );
  res = await res.json();
  let grades = [];
  res.Data.Hodnoceni.forEach((grade) => {
    grades.push({
      Name: grade.NAZEV,
      Grade: grade.VYSLEDEK,
      Weight: grade.DRUH_HODNOCENI,
      Date: grade.DATUM,
      Subject: grade.PREDMET_ID,
      Id: grade.UDALOST_ID,
    });
  });
  return grades;
}
