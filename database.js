const { Pool, Client } = require('pg');

const defaultDbConfig = {
    user: 'postgres',
    host: 'localhost',
    password: '3005',
    port: 5433,
    database: 'postgres'
};

const newDbConfig = {
    user: 'postgres',
    host: 'localhost',
    password: '3005',
    port: 5433,
    database: 'fitness_club_database'
};


const makeDatabase = async () => {

    const defaultClient = new Client(defaultDbConfig);
    await defaultClient.connect();

    try {
        await defaultClient.query('DROP DATABASE IF EXISTS fitness_club_database');
        console.log("Database dropped if exists");

        await defaultClient.query('CREATE DATABASE fitness_club_database');
        console.log("Database created");

    } catch (error) {
        console.error('Error in database operation: ', error);
    } finally {
        await defaultClient.end();
    }

    const pool = new Pool(newDbConfig);
    await pool.connect();

    await pool.query(`
        CREATE TABLE Members(
            MemberID SERIAL PRIMARY KEY,
            FirstName VARCHAR(255),
            LastName VARCHAR(255),
            Email VARCHAR(255),
            Password VARCHAR(255)
        );`);
    console.log("Table Members created");

    await pool.query(`
        CREATE TABLE Trainers(
            TrainerID SERIAL PRIMARY KEY,
            FirstName VARCHAR(255),
            LastName VARCHAR(255),
            Email VARCHAR(255),
            Password VARCHAR(255),
            Certified BOOLEAN
        );`);
    console.log("Table Trainers created");

    await pool.query(`
        CREATE TABLE Admins(
            AdminID SERIAL PRIMARY KEY,
            FirstName VARCHAR(255),
            LastName VARCHAR(255),
            Role VARCHAR(255),
            Email VARCHAR(255),
            Password VARCHAR(255)
        );`);
    console.log("Table Admins created");

    await pool.query(`
        CREATE TABLE HealthMetrics(
            MetricID SERIAL PRIMARY KEY,
            MemberID INT REFERENCES Members(MemberID),
            DateRecorded DATE,
            Weight DECIMAL,
            Height DECIMAL,
            BloodPressure VARCHAR(255),
            HeartRate INT
        );`);
    console.log("Table Health Metrics created");

    await pool.query(`
        CREATE TABLE Rooms(
            RoomID SERIAL PRIMARY KEY,
            RoomName VARCHAR(255),
            Capacity INT
        );`);
    console.log("Table Rooms created");

    await pool.query(`
        CREATE TABLE TrainingSessions(
            SessionID SERIAL PRIMARY KEY,
            MemberID INT REFERENCES Members(MemberID),
            TrainerID INT REFERENCES Trainers(TrainerID),
            Date DATE
        );`);
    console.log("Table Training Sessions created");
            
    await pool.query(`
        CREATE TABLE GroupSessions(
            ClassID SERIAL PRIMARY KEY,
            ClassName VARCHAR(255),
            TrainerID INT REFERENCES Trainers(TrainerID),
            Room INT REFERENCES Rooms(RoomID),
            Date DATE,
            Time VARCHAR(255)
        );`);
    console.log("Table Group Sessions created");

    await pool.query(`
        CREATE TABLE GroupSessionsMembers(
            RegistrationID SERIAL PRIMARY KEY,
            MemberID INT REFERENCES Members(MemberID),
            ClassID INT REFERENCES GroupSessions(ClassID)
        );`)
    console.log("Table Group Sessions Members created");

    await pool.query(`
        CREATE TABLE Workshops(
            WorkshopID SERIAL PRIMARY KEY,
            Name VARCHAR(255),
            Description TEXT,
            Date DATE,
            Time VARCHAR(255),
            Room INT REFERENCES Rooms(RoomID)
        );`);
    console.log("Table Workshops created");

    await pool.query(`
        CREATE TABLE WorkshopMembers(
            RegistrationID SERIAL PRIMARY KEY,
            MemberID INT REFERENCES Members(MemberID),
            WorkshopID INT REFERENCES Workshops(WorkshopID)
        );`);
    console.log("Table Workshop Members created");

    await pool.query(`
        CREATE TABLE Equipment(
            EquipmentID SERIAL PRIMARY KEY,
            Name VARCHAR(255),
            Status VARCHAR(50)
        );`);
    console.log("Table Equipment created");

    await pool.query(`
        CREATE TABLE LoyaltyPoints(
            PointsID SERIAL PRIMARY KEY,
            MemberID INT REFERENCES Members(MemberID),
            Points INT
        );`);
    console.log("Table LoyaltyPoints created");

    await pool.query(`
        CREATE TABLE AdminPay(
            SalaryID SERIAL PRIMARY KEY,
            AdminID INT REFERENCES Admins(AdminID), 
            Salary INT
        );`);
    console.log("Table AdminPay created");

    await pool.query(`    
        CREATE TABLE Guests(            
            GuestID VARCHAR(255) PRIMARY KEY,
            MemberID INT REFERENCES Members(MemberID)
        );`);
    console.log("Table Guests created");

    await pool.query(`
        CREATE TABLE Dependants(        
            FirstName VARCHAR(255) PRIMARY KEY,
            Relationship VARCHAR(255) 
        );`);
    console.log("Table Dependants created");

    await pool.end();
    return;
};

makeDatabase();