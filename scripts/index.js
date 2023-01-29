const token = sessionStorage.getItem("token");
const username = sessionStorage.getItem("username");
if (token == null || username == null) {
  window.location.href = "login.html";
}
let info,
  id,
  subjects

init_data()
.then((id,subs,info) => { 
  check_for_init()
})



async function init_data() {
  let id_res = await fetch_id()
  id = id_res;
  //console.log(id);
  
  let subjects_res = await fetch_subjects()
  subjects = subjects_res;
  //console.log(subjects);

  let user_info_res = await fetch_user_info()
  info = user_info_res;
  //console.log(info);
  await check_for_init()
}

function check_for_init() {
  if (id != null && subjects != null && info != null) {
    const table = document.getElementById("table");
    subjects["D167843"]["grades"].forEach((grade) => {
      const table_length = table.rows.length;
      const row = table.insertRow(table_length += 1);
      let cell1 = row.insertCell(0);
      let cell2 = row.insertCell(1);
      cell1.innerHTML = grade.Name;
      cell2.innerHTML = grade.Grade;
    })
  } else {
    window.setTimeout(checkFlag, 100);
  }
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
    fetch_subject_grades(subject_id)
      .then((res) => {
        sub_grades = res;
      })
      .then(() => {
        subs[subject_id] = { name: name, short: short, grades: sub_grades };
      });
  });
  return subs;
}


async function fetch_subject_grades(subject_id) {
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
  const subject_grades = [];
  res.Data.Hodnoceni.forEach((grade) => {
    if (grade.PREDMET_ID == subject_id) {
      subject_grades.push({
        Name: grade.NAZEV,
        Grade: grade.VYSLEDEK,
        Weight: grade.DRUH_HODNOCENI,
        Date: grade.DATUM,
      });
    }
  });
  return subject_grades;
}
