function submitHealthMetrics() {
    console.log('Got submit health metrics request');
    
    let dateRecorded = document.getElementsByName("dateRecorded")[0].value;
    let weight = document.getElementsByName("weight")[0].value;
    let height = document.getElementsByName("height")[0].value;
    let bloodPressure = document.getElementsByName("bloodPressure")[0].value;
    let heartRate = document.getElementsByName("heartRate")[0].value;

    let healthData = {
        dateRecorded: dateRecorded,
        weight: weight,
        height: height,
        bloodPressure: bloodPressure,
        heartRate: heartRate
    };

    let xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log("Health metrics successfully submitted");
            let response = JSON.parse(this.responseText);
            console.log(response); 
    
            if(response.dateRecorded) {
                let submittedDate = response.dateRecorded.split('T')[0];
                document.getElementById("dateDisplay").innerHTML += `<li>${submittedDate}</li>`; 
            } else {
                console.log("Date recorded not found in response");
            }
        } else if (this.readyState == 4 && this.status == 400) {
            console.log("Bad request at submit health metrics (400)");
            alert("Failed to submit health metrics");
        }
    };
    
    xhttp.open("POST", "/submitHealthMetrics", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(healthData));
}
