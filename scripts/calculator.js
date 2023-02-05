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
  rounded_total_average,
  current_subject,
  custom_id_counter = 0;

date = new Date();
date = date.toISOString();

init_data().then(() => initial_load_page());

refresh_on_timeout()

function refresh_on_timeout() {
  setTimeout(() => {
    refresh_grades();
    refresh_subject();
    refresh_on_timeout();
  }, 1000);
}

async function init_data() {
  id = await fetch_id();
  subjects = await get_user_subjects();
  info = await fetch_user_info();
  categories = await fetch_grade_categories();
  grades = await fetch_grades();
}

function refresh_grades() {
  const table = $('#grades > tbody');
  table.find('tr').each((i,row) => {
    const value = $(row).find('td:eq(1)').find('input').val()
    const placeholder = $(row).find('td:eq(1)').find('input').attr('placeholder')
    const id = $(row).find('td:eq(1)').find('input').attr('id')
    if(value != '') {
      change_grade_by_id(id, value)
    }
    else {
      change_grade_by_id(id, placeholder)
    }
  })
  const average = get_total_average()
  let total_average_text = $('#total_average');
  total_average_text.html(`Average: ${average}`)
}

function change_grade_by_id(id, new_grade) {
  if(new_grade != 'Not assigned') {
    new_grade = Number(new_grade);
  }
  Object.values(grade_info).forEach((category) => {
    category.Grades.forEach((grade) => {
      if (grade.Id == id) {
        grade.Grade = new_grade;
        return;
      }
    });
  });
}

function initial_load_page() {
  $('html').hide()
  let subject_selector = document.getElementById("subject_selector");
  let counter = 0
  Object.keys(subjects).forEach((subject) => {
    let option = document.createElement("option");
    option.value = subject;
    if(counter == 0) {
      option.selected = true;
    }
    counter += 1
    option.innerHTML = subjects[subject].Short;
    subject_selector.appendChild(option);
  })
  current_subject = subject_selector.value;
  load_page();
  $('html').show()
}

function refresh_subject() {
  const subject_input = document.getElementById('subject_selector').value
  if(subject_input != current_subject) {
    current_subject = subject_input
    load_page()
  }
}

function load_page() {
  $('#grades > tbody').empty()
  $('#error_message').hide()
  let grades_from_subject = get_grades_from_subject(current_subject);
  grades_from_subject.forEach((grade) => {
    let table_body = $("#grades > tbody")
    if (grade.Grade == null || grade.Grade == NaN) {
      table_body.append(`<tr><td class="grade_name">${grade.Name}</td><td><input type="number" min="0" max="100" id="${grade.Id}" class="grade_input" placeholder="Not assigned"></td></tr>`)
    } else {
      table_body.append(`<tr><td class="grade_name">${grade.Name}</td><td><input type="number" min="0" max="100" id="${grade.Id}" class="grade_input" placeholder="${grade.Grade}"></td></tr>`)
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

function create_new_grade() {
  let name = $('#new_grade_name').val();
  let grade = $('#new_grade_value').val();
  let weight = $('#new_grade_weight').val();
  if(grade < 0 || grade > 100) {
    $('#error_message').show()
    $('#error_message').html('Grade must be between 0 and 100')
    return
  }
  if(weight < 0 || weight > 100) {
    $('#error_message').show()
    $('#error_message').html('Weight must be between 0 and 100')
    return
  }
  if(name == '') {
    name = `Grade ${custom_id_counter + 1}`
  }
  grade = Number(grade)
  weight = Number(weight)
  $('#error_message').hide()
  weight = weight / 100
  for(let category in grade_info) {
    if(category.Weight = weight) {
      grade_info[category].Grades.push({Grade: grade, Id: `C${custom_id_counter}`})
      custom_id_counter += 1
    }
  }
  $('#grades > tbody').append(`<tr><td class="grade_name">${name}</td><td><input type="number" min="0" max="100" id="C${custom_id_counter}" class="grade_input" placeholder="${grade}"></td></tr>`)
  refresh_grades()
}

function get_total_average() {
  let average = 0;
  let max_divisor = 0
  Object.values(grade_info).forEach((category) => {
    get_category_average(Object.keys(grade_info).find(key => grade_info[key] === category))
    if (category.Average != 'Not assigned' && category.Average != null && category.Average != NaN) {
      average += category.Average * category.Weight;
      max_divisor += category.Weight
    }
  });
  average /= max_divisor
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
    if (grade.Grade != NaN && grade.Grade != null && grade.Grade != 'Not assigned') {
      average += grade.Grade;
    } else {
      unassigned_grades += 1;
    }
  });
  if(counter == unassigned_grades) {
    grade_info[category_id].Average = "Not assigned"
    return "Not assigned"
  }
  else {
    average /= (grade_info[category_id].Grades.length - unassigned_grades);
    grade_info[category_id].Average = average
    return average;
  }
  
}

async function get_user_subjects() {
  subjects = await fetch_subjects()
  grades = await fetch_grades()
  let user_subjects = {}
  grades.forEach((grade) => {
    if(!Object.keys(user_subjects).includes(grade.Subject)) {
      user_subjects[grade.Subject] = subjects[grade.Subject]
    }
  })
  return user_subjects
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
    if (grade.Grade == null || grade.Grade.startsWith('/') || Number(grade.Grade) == NaN) {
      grade.Grade = null;
    } else {
      grade.Grade = Number(grade.Grade);
    }
  });
  return grades;
}
