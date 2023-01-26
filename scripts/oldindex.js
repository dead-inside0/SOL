async function main() {
    const token = sessionStorage.getItem('token')
    const username = sessionStorage.getItem('username')
    let id = await getUserId(token,username)
    let info = await getUserInfo(token, username)
    let grades = await getUserGrades(token)
    let subjects = await getUserSubjects(token)
    if (token == null) {
        window.location.href = 'login.html'
    }
    console.log(getUserGrades())
}   
main()
function getUserInfo(token, username){
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

function getUserGrades(token) {
    let grades = []
    const subjects = getUserSubjects()
    let id = getUserId()
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

function getUserSubjects(token) {
    let subjects = {}
    fetch('https://aplikace.skolaonline.cz/SOLWebApi/api/v1/Predmety',{
        headers : {
            'base64':'1',
            'Authorization':'Basic ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        data['Data'].forEach(subject => {
            const name = subject.NAZEV
            const subject_id = subject.PREDMET_ID
            subjects[subject_id] = name
        })
        return subjects
    })
}

function getUserId(token,username){
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
        return data.Data.OSOBA_ID
    })
}