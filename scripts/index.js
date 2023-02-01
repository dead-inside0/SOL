const token = sessionStorage.getItem("token");
const username = sessionStorage.getItem("username");
if (token == null || username == null) {
  window.location.href = "login.html";
}
let info,
  id,
  subjects,
  grades,
  categories,
  grade_info = {},
  date,
  total_average = 0,
  rounded_total_average;

date = new Date();
date = date.toISOString();

init_data().then(() => load_page());

async function init_data() {
  id = await fetch_id();
  subjects = await fetch_subjects();
  info = await fetch_user_info();
  categories = await fetch_grade_categories();
  grades = await fetch_grades();
}

function refresh_grades() {
  const table = document.getElementById('grades')
  rows = Object.values(table.rows)
  let counter = 0
  for(let row in rows) {
    row = rows[row]
    if(counter == 0) {
        counter+=1
        continue
    }
    let input = row.childNodes[1].value
    console.log(input)
    if(input != '') {
        input = parseInt(input)
        const id = row.childNodes[1].id
        change_grade_by_id(id, input)
    }
    else {
      let placeholder = row.childNodes[1].attributes.placeholder
      placeholder = placeholder.value
      if(placeholder != 'Not assigned') {
        placeholder = parseInt(placeholder)
        const id = row.childNodes[1].id
        change_grade_by_id(id, placeholder)
      }
    }
  }
  let average = get_total_average();
  let total_average_text = document.getElementById("total_average");
  total_average_text.innerHTML = `Average: ${average}`;
}

function change_grade_by_id(id, new_grade) {
  Object.values(grade_info).forEach((category) => {
    category.Grades.forEach((grade) => {
      if (grade.Id == id) {
        grade.Grade = new_grade;
        return;
      }
    });
  });
}

function load_page() {
  let table = document.getElementById("grades");
  let grades_from_subject = get_grades_from_subject("D167843");
  grades_from_subject.forEach((grade) => {
    let row = table.insertRow();
    let name_cell = row.insertCell(0);
    let grade_cell = row.insertCell(1);
    name_cell.innerHTML = grade.Name;
    if (grade.Grade == null) {
      grade_cell.outerHTML = `<input type="text" id="${grade.Id}" placeholder="Not assigned"></td>`;
    } else {
      grade_cell.outerHTML = `<input type="text" id="${grade.Id}" placeholder="${grade.Grade}"></td>`;
    }
  });
  let average = get_total_average();
  let total_average_text = document.getElementById("total_average");
  total_average_text.innerHTML = `Average: ${average}`;
}

function get_grades_from_subject(subject_id) {
  grades_from_subject = [];
  grade_info = {};
  grades.forEach((grade) => {
    if (grade.Subject == subject_id) {
      grades_from_subject.push(grade);
      add_grade_to_category(grade.Grade, grade.Id, grade.Category);
    }
  });
  console.log(get_total_average());
  return grades_from_subject;
}

function add_grade_to_category(grade, id, category_id) {
  if (typeof grade_info[category_id] != "object") {
    grade_info[category_id] = {
      Weight: categories[category_id],
      Grades: [],
      Average: 0,
    };
  }
  grade_info[category_id].Grades.push({
    Grade: grade,
    Id: id,
  });
  grade_info[category_id].Average = get_category_average(category_id);
}

function get_total_average() {
  let average = 0;
  let max_average_percent = 1
  Object.values(grade_info).forEach((category) => {
    get_category_average(Object.keys(grade_info).find(key => grade_info[key] === category))
    if (typeof category.Average == "number") {
      average += category.Average * category.Weight;
    }
    else {
        max_average_percent -= category.Weight
    }
  });
  average /= max_average_percent;
  total_average = average;
  rounded_total_average = Math.round(average);
  return rounded_total_average;
}

function get_category_average(category_id) {
  let average = 0;
  let counter = 0;
  let unassigned_grades = 0;
  grade_info[category_id].Grades.forEach((grade) => {
    counter += 1;
    if (typeof grade.Grade == "number") {
      average += grade.Grade;
    } else {
      unassigned_grades += 1;
    }
  });
  average /= grade_info[category_id].Grades.length - unassigned_grades;
  grade_info[category_id].Average = average
  return average;
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

async function fetch_grade_categories() {
  let grade_categories = {};
  let res = await fetch(
    "https://aplikace.skolaonline.cz/SOLWebApi/api/v1/DruhyHodnoceni",
    {
      headers: {
        base64: "1",
        Authorization: "Basic " + token,
      },
    }
  );
  res = await res.json();
  res = res.Data;
  res.forEach((category) => {
    grade_categories[category.DRUH_HODNOCENI_ID] = Number(category.VAHA);
  });
  return grade_categories;
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
    subs[subject_id] = { Name: name, Short: short };
  });
  return subs;
}

function check_for_number(grade) {
  if (grade == null) {
    return null;
  } else {
    return Number(grade);
  }
}

async function fetch_grades() {
  let res = await fetch(
    `https://aplikace.skolaonline.cz/SOLWebApi/api/v1/VypisHodnoceniStudent?studentId=${id}&datumDo=${date}`,
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
      Category: grade.DRUH_HODNOCENI_ID,
      Date: grade.DATUM,
      Subject: grade.PREDMET_ID,
      Id: grade.UDALOST_ID,
    });
  });
  await grades.forEach((grade) => {
    if (grade.Grade == null) {
      grade.Grade = null;
    } else {
      grade.Grade = Number(grade.Grade);
    }
  });
  return grades;
}
