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

app.get('/playlist', (req, res) => {
    connection.query('SELECT * FROM playlist', (error, results) => {
        if (error) {
            console.error('Error fetching playlist:', error);
            return res.status(500).json({ error: "Failed to fetch playlist" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "No playlists found" });
        }
        return res.status(200).json(results);
    });
});

app.get('/playlist/:userId', (req, res) => {
    const playlistId = req.body.playlistId;
    const userId = req.params.userId;
    connection.query('SELECT program.* FROM program JOIN playlist ON program.id = playlist.programId WHERE playlist.id = ? AND playlist.userId = ?', [playlistId ,userId], (error, results) => {
        if (error) {
            console.error('Error fetching programs for playlist:', error);
            return res.status(500).json({ error: "Failed to fetch programs for playlist" });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: "No programs found for this playlist" });
        }
        return res.status(200).json(results);
    });
});

app.patch('/playlist/:programId', (req, res) => {
    const programId = req.params.programId;
    const newPlaylistName = req.body.playlistName;
    const newPosition = req.body.position;
    connection.query('UPDATE playlist SET playlistName = ?,position = ? WHERE programId = ?', [newPlaylistName,newPosition, programId], (error, results) => {
        if (error) {
            console.error('Error updating program playlist:', error);
            return res.status(500).json({ error: "Failed to update program playlist" });
        }
        if (results.affectedRows === 0) { 
            return res.status(404).json({ message: "Program or playlist not found" });
        }
        return res.status(200).json({ message: "Program playlist updated successfully" });
    });
});

app.post('/playlist', (req, res) => {
    const { playlistName, position, programId, userId } = req.body;

    if (!playlistName || !position || !programId || !userId) {
        return res.status(400).json({ error: "playlistName, position, programId, and userId are required" });
    }

    const playlistData = { playlistName, position, programId, userId };

    connection.query('INSERT INTO playlist SET ?', playlistData, (error, results, fields) => {
        if (error) {
            console.error('Error inserting playlist:', error);
            return res.status(500).json({ error: "Failed to add playlist" });
        }
        console.log('playlist added successfully');
        return res.status(201).json({ message: "playlist added successfully", playlistId: results.insertId });
    });
});

