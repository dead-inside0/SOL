const token = sessionStorage.getItem('token')
const username = sessionStorage.getItem('username')
let info, id, subjects = {}, grades = []
let isLoaded = false
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
    info = data.Data
    id = data.Data.OSOBA_ID


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
            const short = subject.ZKRATKA
            subjects[subject_id] = {name:name,short:short,grades:[]}
        })

        fetch(`https://aplikace.skolaonline.cz/SOLWebApi/api/v1/UzivatelInfo?studentID=${id}`,{
            headers : {
                'base64':'1',
                'Authorization':'Basic ' + token
            }
        })
        .then(response => response.json())
        .then(data => {
            data.Data.HODNOCENI.forEach(grade => {
                grade.PREDMET_ID.push({
                    grade: grade.VYSLEDEK,
                    weight: grade.DRUH_HODNOCENI_ID,
                    name : grade.NAZEV
                })
            })
            console.log(grades)
        })
    })
})



