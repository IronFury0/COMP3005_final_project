const express = require('express');
const session = require('express-session');
const { Pool } = require('pg');
const app = express();

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: '3005',
    port: 5433,
    database: 'fitness_club_database'
});

app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "pug");
app.set('views', './views');

app.use(session({
    secret: 'abracadabra',
    resave: true,
    saveUninitialized: true
}));

app.get("/", (req, res) => {
    res.render("homePage", {});
    return;
});

app.get("/login", (req, res) => {
    res.render("login", { flag: 0 });
    return;
});

app.get("/signUp", (req, res) => {
    res.render("login", { flag: 1 });
    return;
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});

app.post("/login", async (req, res) => {
    let username = req.body.email; 
    let pass = req.body.password;
    let check = req.body.check; 

    if (!req.session.loggedin) {
        if (check === 0) { // Login 
            console.log("login");
            try {
                const result = await pool.query(`SELECT * FROM members WHERE Email = '${username}' AND Password = '${pass}'`);
                if (result.rows.length > 0) {
                    req.session.loggedin = true;
                    req.session.username = username;
                    req.session.userid = result.rows[0].memberid; 
                    res.status(200).end();
                } else {
                    res.status(400).end();
                }
            } catch (err) {
                console.error(err);
                res.status(500).end();
            }
        } else { // Sign-up 
            console.log("sign-up");

            let first = req.body.firstName;
            let last = req.body.lastName; 
            try {
                const queryResult = await pool.query(`SELECT * FROM members WHERE Email = '${username}'`);
                if (queryResult.rows.length === 0 && username && pass) {
                    const insertResult = await pool.query(`INSERT INTO members (Email, Password, FirstName, LastName) VALUES ('${username}', '${pass}', '${first}', '${last}') RETURNING MemberID`);
                    req.session.loggedin = true;
                    req.session.username = username;
                    req.session.userid = insertResult.rows[0].memberid;
                    res.status(200).end();
                } else {
                    res.status(400).end();
                }
            } catch (err) {
                console.error(err);
                res.status(500).end();
            }
        }
    } else {
        res.status(429).end();
    }
});

app.get("/registration", async (req, res) => {
    try {

        const workshopsResult = await pool.query("SELECT * FROM Workshops;");

        const trainersResult = await pool.query(`SELECT * FROM Trainers;`);

        const publicTrainingsResult = await pool.query("SELECT * FROM GroupSessions;");
        //console.log(publicTrainingsResult.rows);

        res.render("registration", {
            session: req.session,
            workshops: workshopsResult.rows,
            privateTrainings: trainersResult.rows,
            publicTrainings: publicTrainingsResult.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

app.get("/userInfo", async (req, res) => {
    if (req.session.loggedin) {
        try {
            const memberResult = await pool.query(`SELECT * FROM members WHERE memberid = ${req.session.userid}`);
            console.log(memberResult.rows)

            if (memberResult.rows.length > 0) {
                //const userResult = memberResult.rows[0];

                const workshops = await pool.query(`SELECT * FROM Workshops INNER JOIN WorkshopMembers ON Workshops.WorkshopID = WorkshopMembers.WorkshopID WHERE WorkshopMembers.MemberID = ${req.session.userid}`);
                //console.log(workshops.rows)

                const privateTrainings = await pool.query(`SELECT TrainingSessions.*, Trainers.FirstName AS TrainerFirstName, Trainers.LastName AS TrainerLastName FROM TrainingSessions INNER JOIN Trainers ON TrainingSessions.TrainerID = Trainers.TrainerID WHERE TrainingSessions.MemberID = ${req.session.userid};`);
               // console.log(privateTrainings.rows)

                const publicTrainings = await pool.query(`SELECT GroupSessions.* FROM GroupSessions INNER JOIN GroupSessionsMembers ON GroupSessions.ClassID = GroupSessionsMembers.ClassID WHERE GroupSessionsMembers.MemberID = ${req.session.userid}`);
                //console.log(publicTrainings.rows);

                //console.log("id: ", req.session.userid);
                const healthDataResults = await pool.query(`SELECT daterecorded FROM HealthMetrics WHERE memberid = ${req.session.userid}`);

                res.render("userInfo", {
                    session: req.session,
                    u: memberResult.rows[0],
                    workshops: workshops.rows,
                    privateTrainings: privateTrainings.rows,
                    publicTrainings: publicTrainings.rows,
                    healthDates: healthDataResults.rows
                });
            } else {
                res.status(404).send("User not found");
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    } else {
        res.status(401).send("User not logged in");
    }
});


app.post("/submitHealthMetrics", async (req, res) => {
    try {
        let data = req.body;
        let memberID = req.session.userid; 

        const insertResult = await pool.query(`INSERT INTO HealthMetrics (MemberID, DateRecorded, Weight, Height, BloodPressure, HeartRate) VALUES ('${memberID}', '${data.dateRecorded}', '${data.weight}', '${data.height}', '${data.bloodPressure}', '${data.heartRate}') RETURNING daterecorded`);

        res.status(200).json({dateRecorded: insertResult.rows[0].daterecorded});

    } catch (error) {

        console.error("Error inserting health metrics: ", error);
        res.status(500).send('Server error occurred');
    }
});

app.get('/addWorkshop', (req, res) => {
    res.render('addWorkshop'); 
});

app.get('/addTrainingSession', (req, res) => {
    res.render('addTrainingSession'); 
});

app.get('/addClass', (req, res) => {
    res.render('addClass'); 
});

app.post('/submitTrainingSession', async (req, res) => {
    try {
        const { memberID, trainerID, sessionDate } = req.body;

        await pool.query(`INSERT INTO TrainingSessions (MemberID, TrainerID, Date) VALUES ('${memberID}', '${trainerID}', '${sessionDate}')`);

        res.status(200).json({ message: "Training session added successfully" });

    } catch (error) {

        console.error("Error inserting training session: ", error);
        res.status(500).send('Server error occurred');
    }
});

app.post('/addWorkshop', async (req, res) => {
    try {
        const { workshopName, description, date, startTime, room } = req.body;
       
        await pool.query(`INSERT INTO Workshops (WorkshopName, Description, Date, Time, Room) VALUES ('${workshopName}', '${description}', '${date}', '${startTime}', '${room}')`);

        res.status(200).json({ message: "Workshop added successfully" });

    } catch (error) {

        console.error("Error inserting workshop: ", error);
        res.status(500).send('Server error occurred');
    }
});

app.post('/submitGroupClass', async (req, res) => {
    try {
        const { className, trainerID, room, classDate, startTime } = req.body;
        await pool.query(`INSERT INTO GroupSessions (ClassName, TrainerID, Room, Date, Time) VALUES ('${className}', '${trainerID}', '${room}', '${classDate}', '${startTime}')`);

        res.status(200).json({ message: "Group class added successfully" });

    } catch (error) {

        console.error("Error inserting group class: ", error);
        res.status(500).send('Server error occurred');
    }
});

app.get("/workshopDetails", async (req, res) => {
    try {
        const workshopId = req.query.workshopId;

        const workshopResult = await pool.query(`SELECT * FROM Workshops WHERE workshopid = ${workshopId};`);

        res.render("workshopDetailsPage", { 
            workshop: workshopResult.rows[0]
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Server error");
    }
});

app.get("/registerWorkshop", async (req, res) => {
    try {
        const workshopId = req.query.workshopId;
        const memberId = req.session.userid; 

        await pool.query(`INSERT INTO WorkshopMembers (MemberID, WorkshopID) VALUES (${memberId}, ${workshopId});`);

        res.redirect('/userInfo');

    } catch (err) {

        console.error(err);
        res.status(500).send("Server error");
    }
});

app.get("/trainingSessionDetails", async (req, res) => {
    try {
        const trainerId = req.query.trainerId;

        const trainerResult = await pool.query(`SELECT * FROM Trainers WHERE TrainerID = ${trainerId};`);

        res.render("trainerDetailsPage", { 
            trainer: trainerResult.rows[0]
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Server error");
    }
});

app.get("/registerTrainingSession", async (req, res) => {
    try {
        const trainerId = req.query.trainerId;
        const memberId = req.session.userid;

        const currentDate = new Date().toISOString().split('T')[0];

        await pool.query(`INSERT INTO TrainingSessions (MemberID, TrainerID, Date) VALUES (${memberId}, ${trainerId}, '${currentDate}');`);

        res.redirect('/userInfo');

    } catch (err) {

        console.error(err);
        res.status(500).send("Server error");
    }
});

app.get("/classDetails", async (req, res) => {
    try {
        const classId = req.query.classId; 

       const classResult = await pool.query(`SELECT GroupSessions.*, Trainers.FirstName AS TrainerFirstName, Trainers.LastName AS TrainerLastName FROM GroupSessions INNER JOIN Trainers ON GroupSessions.TrainerID = Trainers.TrainerID WHERE GroupSessions.ClassID = ${classId};`);

        //console.log(classResult.rows)
        res.render("classDetailsPage", { 
            c: classResult.rows[0]
        });

    } catch (err) {

        console.error(err);
        res.status(500).send("Server error");
    }
});

app.get("/registerForClass", async (req, res) => {
    try {
        const classId = req.query.classId;
        const memberId = req.session.userid;

        await pool.query(`INSERT INTO GroupSessionsMembers (MemberID, ClassID) VALUES (${memberId}, ${classId})`);

        res.redirect('/userInfo'); 

    } catch (err) {

        console.error(err);
        res.status(500).send("Server error");
    }
});



app.get("/logout",(req, res)=> {
    if(req.session.loggedin) {
		req.session.loggedin = false;
	}
	res.redirect(`http://localhost:3001/`);
});

//module.exports = pool;