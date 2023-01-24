function Login() {
    const username = btoa(document.getElementById('username').value)
    const password = btoa(document.getElementById('password').value)
    const token = btoa(username + ':' + password)
    fetch('https://aplikace.skolaonline.cz/SOLWEBApi/api/v1/AuthorizationStatus', {
        headers : {
            'base64':'1',
            'Authorization':'Basic ' + token
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.Status.Code == 'OK') {
            sessionStorage.setItem('token', token)
            sessionStorage.setItem('username', username)
            window.location.href = 'index.html'
        } else {
            alert('Nesprávné přihlašovací údaje')
        }
    })
}