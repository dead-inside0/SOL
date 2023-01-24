
const token = sessionStorage.getItem('token')
const username = sessionStorage.getItem('username')
if (token == null) {
    window.location.href = 'login.html'
}
const id = getUserId()
console.log(getUserGrades())

function getUserInfo(){
    fetch('https://aplikace.skolaonline.cz/SOLWebApi/api/v1/UzivatelInfo', {
    method: 'POST',
    headers: {
       'base64': '1',
        'Authorization': 'Basic ' + token,
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json'
    },
    body: '"'+username+'"'
    })
    .then(response => response.json())
    .then(data => {
        return data.Data
    })
}

function getUserGrades() {
    let grades = []
    const subjects = getUserSubjects()
    fetch(`https://aplikace.skolaonline.cz/SOLWebApi/api/v1/UzivatelInfo?studentID=${id}`,{
        headers : {
            'base64':'1',
            'Authorization':'Basic ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        data.Data.HODNOCENI.forEach(grade => {
            grades.push({
                subject: subjects[grade.PREDMET],
                grade: grade.VYSLEDEK,
                weight: grade.DRUH_HODNOCENI_ID,
                name : grade.NAZEV
            })
        })
        return grades
    })
}

function getUserSubjects() {
    let subjects = {}
    fetch('https://aplikace.skolaonline.cz/SOLWebApi/api/v1/Predmety',{
        headers : {
            'base64':'1',
            'Authorization':'Basic ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        data.Data.forEach(subject => {
            const name = subject.NAZEV
            const id = subject.PREDMET_ID
            subjects.push({id:name})
        })
        return subjects
    })
}

function getUserId(){
    const userInfo = getUserInfo()
    return userInfo.OSOBA_ID
}