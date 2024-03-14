const mysql = require('mysql');

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

    connection.query('CREATE TABLE IF NOT EXISTS program ( id INT AUTO_INCREMENT PRIMARY KEY, programName VARCHAR(255) NOT NULL, videoUrl VARCHAR(255) NOT NULL);', (error) => {
        if (error) {
            console.error('Error creating program table:', error);
        } else {
            console.log('Program table created successfully');
        }
    });
    
    connection.query('CREATE TABLE IF NOT EXISTS playlist ( id INT AUTO_INCREMENT PRIMARY KEY, playlistName VARCHAR(255) NOT NULL, position INT NOT NULL, programId INT, userId INT, FOREIGN KEY (programId) REFERENCES program(id));', (error) => {
        if (error) {
            console.error('Error creating playlist table:', error);
        } else {
            console.log('Playlist table created successfully');
        }
    });


});

const query = async (sql) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

module.exports = query;