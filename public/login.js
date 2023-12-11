function sendUserCredentialsInfo(check) {
    let email = document.getElementById("email").value;
    let pass = document.getElementById("password").value;
    let firstName = check !== 0 ? document.getElementById("firstName").value : '';
    let lastName = check !== 0 ? document.getElementById("lastName").value : '';

    let data = {
        email: email,
        password: pass,
        check: check
    };

    if (check !== 0) {
        data.firstName = firstName;
        data.lastName = lastName;
    }

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log("Got a response, good");
            if (check == 0) {
                alert("User logged in");
            } else {
                alert("User created");
            }
            window.location.href = "/userInfo";
        } else if (this.readyState == 4 && this.status == 400) {
            console.log("Got bad request at user login/sign-up (400)");

            if (check == 0) {
                alert("Invalid login credentials");
                document.getElementById("email").classList.add("error");
                document.getElementById("password").classList.add("error");
            } else {
                document.getElementById("email").classList.add("error");
                alert("Username is already taken or invalid input");
            }
        } else if (this.readyState == 4 && this.status == 429) {
            console.log("Too many users logged in (429)");
            alert("Too many users logged in");
            window.location.href = "/";
        }
    };

    xhttp.open("POST", "/login", true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.send(JSON.stringify(data));
}
