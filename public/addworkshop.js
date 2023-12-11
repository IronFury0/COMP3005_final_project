function submitWorkshop() {
    let workshopName = document.getElementsByName("workshopName")[0].value;
    let description = document.getElementsByName("description")[0].value;
    let date = document.getElementsByName("date")[0].value;
    let startTime = document.getElementsByName("startTime")[0].value;
    let room = document.getElementsByName("room")[0].value;

    let workshopData = {
        workshopName: workshopName,
        description: description,
        date: date,
        startTime: startTime,
        room: room
    };
    console.log(workshopData);

    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log("Workshop successfully submitted");
            let response = JSON.parse(this.responseText);
            console.log(response); 

        } else if (this.readyState == 4) {
            console.error("Failed to submit workshop: " + this.status);
        }
    };
    
    xhttp.open("POST", "/addWorkshop", true);
    xhttp.setRequestHeader("Content-type", "application/json");
   xhttp.send(JSON.stringify(workshopData));
}
