const express = require('express');
const bodyParser = require('body-parser');
// const mysql = require('mysql');
const multer =require('multer');


const app = express();
const cors = require('cors');
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// const upload = multer();


app.get('/program', (req, res) => {
    connection.query('SELECT * FROM program', (error, results) => {
        if (error) {
            console.error('Error fetching program:', error);
            return res.status(500).json({ error: "Failed to fetch program" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "No programs found" });
        }
        return res.status(200).json(results);
    });
});

app.post('/program', (req, res) => {
    const { programName, videoUrl } = req.body;

    if (!programName || !videoUrl) {
        return res.status(400).json({ error: "programName and videoUrl are required" });
    }

    const programData = { programName, videoUrl};

    connection.query('INSERT INTO program SET ?', programData, (error, results, fields) => {
        if (error) {
            console.error('Error inserting program:', error);
            return res.status(500).json({ error: "Failed to add program" });
        }
        console.log('Program added successfully');
        return res.status(201).json({ message: "Program added successfully", programId: results.insertId });
    });
});

app.patch('/program/:programId', (req, res) => {
    const programId = req.params.programId;
    const { programName, videoUrl } = req.body;

    if (!programName && !videoUrl) {
        return res.status(400).json({ error: "At least one of programName or videoUrl is required for update" });
    }

    const programData = {};
    if (programName) {
        programData.programName = programName;
    }
    if (videoUrl) {
        programData.videoUrl = videoUrl;
    }

    connection.query('UPDATE program SET ? WHERE id = ?', [programData, programId], (error, results) => {
        if (error) {
            console.error('Error updating program:', error);
            return res.status(500).json({ error: "Failed to update program" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Program not found" });
        }
        console.log('Program updated successfully');
        return res.status(200).json({ message: "Program updated successfully" });
    });
});