const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer =require('multer');


const app = express();
const cors = require('cors');
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const upload = multer();

const connection = mysql.createConnection({
    host: "tgm.c5k0kmyg2vmm.eu-north-1.rds.amazonaws.com",
    user: "admin",
    password: "germane123",
    port: 3306,
    database: "db"
});

connection.connect(function(err) {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');

    connection.query('CREATE TABLE IF NOT EXISTS channel ( id INT AUTO_INCREMENT PRIMARY KEY, channelName VARCHAR(255) NOT NULL, channelNumber VARCHAR(255) NOT NULL, image BLOB);', (error) => {
        if (error) {
            console.error('Error creating channel table:', error);
        } else {
            console.log('Channel table created successfully');
        }
    });

    connection.query('CREATE TABLE IF NOT EXISTS program ( id INT AUTO_INCREMENT PRIMARY KEY, programName VARCHAR(255) NOT NULL, videoUrl VARCHAR(255) NOT NULL, image BLOB);', (error) => {
        if (error) {
            console.error('Error creating program table:', error);
        } else {
            console.log('Program table created successfully');
        }
    });
    
    connection.query('CREATE TABLE IF NOT EXISTS playlist ( id INT AUTO_INCREMENT PRIMARY KEY, playlistName VARCHAR(255) NOT NULL, position INT NOT NULL, programId INT, userId INT, FOREIGN KEY (programId) REFERENCES program(id), FOREIGN KEY (userId) REFERENCES user(id));', (error) => {
        if (error) {
            console.error('Error creating playlist table:', error);
        } else {
            console.log('Playlist table created successfully');
        }
    });


});


app.get('/channel', (req, res) => {
  connection.query('SELECT * FROM channel', (error, results) => {
      if (error) {
          console.error('Error fetching channel:', error);
          return res.status(500).json({ error: "Failed to fetch channel" });
      }
      return res.status(200).json(results);
  });
});

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

app.get('/playlist/:playlistId', (req, res) => {
    const playlistId = req.params.playlistId;
    connection.query('SELECT program.* FROM program JOIN playlist ON program.id = playlist.programId WHERE playlist.id = ?', [playlistId], (error, results) => {
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

app.patch('/program/:programId', (req, res) => {
    const programId = req.params.programId;
    const newPlaylistId = req.body.PlaylistId;
    connection.query('UPDATE playlist SET playlistId = ? WHERE programId = ?', [newPlaylistId, programId], (error, results) => {
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


app.get('/channel/:searchTerm', (req, res) => {
    const searchTerm = req.params.searchTerm;

    if (!searchTerm) {
        return res.status(400).json({ error: "searchTerm parameter is required" });
    }

    const sqlQuery = 'SELECT * FROM channel WHERE channelName REGEXP ? OR channelNumber REGEXP ?';
    const sqlParams = [searchTerm, searchTerm];

    connection.query(sqlQuery, sqlParams, (error, results) => {
        if (error) {
            console.error('Error fetching channels:', error);
            return res.status(500).json({ error: "Failed to fetch channels" });
        }
        return res.status(200).json(results);
    });
});

app.put('/upload/:channelId', upload.single('image'), async (req, res) => {
    try {
      const { channelId } = req.params;
      const imageData = req.file.buffer;
  
      connection.query('UPDATE channel SET image = ? WHERE id = ?', [imageData, channelId], (error, results) => {
        if (error) {
          console.error('Error updating channel:', error);
          return res.status(500).json({ error: "Failed to update channel" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Channel not found" });
        }
        console.log('Channel updated successfully');
        return res.status(200).json({ message: "Channel updated successfully" });
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return res.status(500).json({ error: "Failed to upload image" });
    }
  });
  

app.get('/channel/search', (req, res) => {
    const searchTerm = req.body.searchTerm;

    if (!searchTerm) {
        return res.status(400).json({ error: "searchTerm parameter is required" });
    }

    const sqlQuery = 'SELECT * FROM channel WHERE channelName REGEXP ? OR channelNumber REGEXP ?';
    const sqlParams = [searchTerm, searchTerm];

    connection.query(sqlQuery, sqlParams, (error, results) => {
        if (error) {
            console.error('Error fetching channels:', error);
            return res.status(500).json({ error: "Failed to fetch channels" });
        }
        return res.status(200).json(results);
    });
});


app.get('/channel/:id', (req, res) => {
  const channelId = req.params.id;

  connection.query('SELECT * FROM channel WHERE id = ?', channelId, (error, results) => {
      if (error) {
          console.error('Error fetching channel:', error);
          return res.status(500).json({ error: "Failed to fetch channel" });
      }
      if (results.length === 0) {
          return res.status(404).json({ error: "channel not found" });
      }
      return res.status(200).json(results[0]);
  });
});

app.post('/channel', (req, res) => {
    const { channelName, channelNumber } = req.body;

    if (!channelName || !channelNumber) {
        return res.status(400).json({ error: "channelName and channelNumber are required" });
    }

    const channelData = { channelName, channelNumber };

    connection.query('INSERT INTO channel SET ?', channelData, (error, results, fields) => {
        if (error) {
            console.error('Error inserting channel:', error);
            return res.status(500).json({ error: "Failed to add channel" });
        }
        console.log('channel added successfully');
        return res.status(201).json({ message: "channel added successfully", channelId: results.insertId });
    });
});

app.put('/channel/:id', (req, res) => {
    const channelId = req.params.id;
    const { channelName, channelNumber } = req.body;

    if (!channelName && !channelNumber) {
        return res.status(400).json({ error: "At least one of channelName or channelNumber is required for update" });
    }

    const channelData = {};
    if (channelName) {
        channelData.channelName = channelName;
    }
    if (channelNumber) {
        channelData.channelNumber = channelNumber;
    }

    connection.query('UPDATE channel SET ? WHERE id = ?', [channelData, channelId], (error, results) => {
        if (error) {
            console.error('Error updating channel:', error);
            return res.status(500).json({ error: "Failed to update channel" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "channel not found" });
        }
        console.log('channel updated successfully');
        return res.status(200).json({ message: "channel updated successfully" });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
