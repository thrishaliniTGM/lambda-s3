
// const express = require('express');
// const bodyParser = require('body-parser');
// // const mysql = require('mysql');
// const multer =require('multer');


// const app = express();
// const cors = require('cors');
// const port = 3000;

// app.use(bodyParser.json());
// app.use(cors());

// const upload = multer();

// app.get('/channel', (req, res) => {
//     connection.query('SELECT * FROM channel', (error, results) => {
//         if (error) {
//             console.error('Error fetching channel:', error);
//             return res.status(500).json({ error: "Failed to fetch channel" });
//         }
//         return res.status(200).json(results);
//     });
//   });

  
// app.get('/channel/:id', (req, res) => {
//     const channelId = req.params.id;
  
//     connection.query('SELECT * FROM channel WHERE id = ?', channelId, (error, results) => {
//         if (error) {
//             console.error('Error fetching channel:', error);
//             return res.status(500).json({ error: "Failed to fetch channel" });
//         }
//         if (results.length === 0) {
//             return res.status(404).json({ error: "channel not found" });
//         }
//         return res.status(200).json(results[0]);
//     });
//   });


// app.get('/channel/search', (req, res) => {
//     const searchTerm = req.body.searchTerm;

//     if (!searchTerm) {
//         return res.status(400).json({ error: "searchTerm parameter is required" });
//     }

//     const sqlQuery = 'SELECT * FROM channel WHERE channelName REGEXP ? OR channelNumber REGEXP ?';
//     const sqlParams = [searchTerm, searchTerm];

//     connection.query(sqlQuery, sqlParams, (error, results) => {
//         if (error) {
//             console.error('Error fetching channels:', error);
//             return res.status(500).json({ error: "Failed to fetch channels" });
//         }
//         return res.status(200).json(results);
//     });
// });

// app.post('/channel', (req, res) => {
//     const { channelName, channelNumber } = req.body;

//     if (!channelName || !channelNumber) {
//         return res.status(400).json({ error: "channelName and channelNumber are required" });
//     }

//     const channelData = { channelName, channelNumber };

//     connection.query('INSERT INTO channel SET ?', channelData, (error, results, fields) => {
//         if (error) {
//             console.error('Error inserting channel:', error);
//             return res.status(500).json({ error: "Failed to add channel" });
//         }
//         console.log('channel added successfully');
//         return res.status(201).json({ message: "channel added successfully", channelId: results.insertId });
//     });
// });

// app.put('/channel/:id', (req, res) => {
//     const channelId = req.params.id;
//     const { channelName, channelNumber } = req.body;

//     if (!channelName && !channelNumber) {
//         return res.status(400).json({ error: "At least one of channelName or channelNumber is required for update" });
//     }

//     const channelData = {};
//     if (channelName) {
//         channelData.channelName = channelName;
//     }
//     if (channelNumber) {
//         channelData.channelNumber = channelNumber;
//     }

//     connection.query('UPDATE channel SET ? WHERE id = ?', [channelData, channelId], (error, results) => {
//         if (error) {
//             console.error('Error updating channel:', error);
//             return res.status(500).json({ error: "Failed to update channel" });
//         }
//         if (results.affectedRows === 0) {
//             return res.status(404).json({ error: "channel not found" });
//         }
//         console.log('channel updated successfully');
//         return res.status(200).json({ message: "channel updated successfully" });
//     });
// });

// app.patch('/upload/:channelId', upload.single('image'), async (req, res) => {
//     try {
//       const { channelId } = req.params;
//       const imageData = req.file.buffer;
  
//       connection.query('UPDATE channel SET image = ? WHERE id = ?', [imageData, channelId], (error, results) => {
//         if (error) {
//           console.error('Error updating channel:', error);
//           return res.status(500).json({ error: "Failed to update channel" });
//         }
//         if (results.affectedRows === 0) {
//           return res.status(404).json({ error: "Channel not found" });
//         }
//         console.log('Channel updated successfully');
//         return res.status(200).json({ message: "Channel updated successfully" });
//       });
//     } catch (error) {
//       console.error('Error uploading image:', error);
//       return res.status(500).json({ error: "Failed to upload image" });
//     }
//   });


// const mysql = require('mysql');
const multer = require('multer');
const connection = require('../components/rdsConnection');

exports.handler = async (event) => {
    try {
        const { httpMethod, path,pathParameters, body } = event;
        console.log(event);
        let response;
        switch (httpMethod) {
            case 'GET':
               if(path === '/channel'&& pathParameters.id){
                    let channelId = pathParameters.id;
                    response = await handleGetChannelById(channelId);
                }
                else if (path === '/channel') {
                    response = await handleGetAllChannels();
                } 
                else if (path.startsWith('/channel/search')) {
                    const searchTerm = body ? JSON.parse(body).searchTerm : null;
                    response = await handleSearchChannel(searchTerm);
                }
                else{
                    response = {
                        statusCode: 500,
                        body: JSON.stringify({ error: 'route Not present' })
                    };
                }
                break;
            case 'POST':
                const { channelName, channelNumber } = JSON.parse(body);
                response = await handlePostChannel(channelName, channelNumber);
                break;
                
            case 'PUT':
                const { id } = pathParameters;
                const { channelName: putChannelName, channelNumber: putChannelNumber } = JSON.parse(body);
                response = await handlePutChannel(id, putChannelName, putChannelNumber);
                break;
                
            case 'PATCH':
            
                try {
                    return await handlePatchChannelImage(event);
                } catch (error) {
                    console.error('Error:', error);
                    return {
                        statusCode: 500,
                        body: JSON.stringify({ error: 'Internal Server Error' })
                    };
                }
                
            default:
                response = {
                    statusCode: 405,
                    body: JSON.stringify({ error: 'Method Not Allowed' })
                };
        }

        return response;
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};

const handleGetAllChannels = async () => {
    try {
        const results = await query('SELECT * FROM channel');
        return {
            statusCode: 200,
            body: JSON.stringify(results)
        };
    } catch (error) {
        console.error('Error fetching channels:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch channels" })
        };
    }
};

const handleGetChannelById = async (id) => {
    try {
        const results = await query(`SELECT * FROM channel WHERE id = ${id}`);
        if (results.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Channel not found" })
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify(results[0])
        };
    } catch (error) {
        console.error('Error fetching channel:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch channel" })
        };
    }
};

const handleSearchChannel = async (searchTerm) => {
    try {
        if (!searchTerm) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "searchTerm parameter is required" })
            };
        }

        const sqlQuery = 'SELECT * FROM channel WHERE channelName REGEXP ? OR channelNumber REGEXP ?';
        const sqlParams = [searchTerm, searchTerm];

        const results = await query(sqlQuery, sqlParams);
        return {
            statusCode: 200,
            body: JSON.stringify(results)
        };
    } catch (error) {
        console.error('Error fetching channels:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch channels" })
        };
    }
};



const handlePostChannel = async (channelName, channelNumber) => {
    try {
        const results = await query(`INSERT INTO channel (channelName, channelNumber) VALUES ('${channelName}', '${channelNumber}')`);
        return {
            statusCode: 201,
            body: JSON.stringify({ message: "Channel added successfully", channelId: results.insertId })
        };
    } catch (error) {
        console.error('Error inserting channel:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to add channel" })
        };
    }
};

const handlePutChannel = async (id, channelName, channelNumber) => {
    try {
        let updateFields = '';
        if (channelName) {
            updateFields += `channelName = '${channelName}'`;
        }
        if (channelNumber) {
            if (channelName) updateFields += ', ';
            updateFields += `channelNumber = '${channelNumber}'`;
        }

        await query(`UPDATE channel SET ${updateFields} WHERE id = ${id}`);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Channel updated successfully" })
        };
    } catch (error) {
        console.error('Error updating channel:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to update channel" })
        };
    }
};

const handlePatchChannelImage = async (event) => {
    try {
        const { channelId } = event.pathParameters;
        const imageData = Buffer.from(event.body, 'base64'); 

        const query = 'UPDATE channel SET image = ? WHERE id = ?';
        const params = [imageData, channelId];

        connection.query(query, params, (error, results) => {
            if (error) {
                console.error('Error updating channel:', error);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ error: "Failed to update channel" })
                };
            }
            if (results.affectedRows === 0) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: "Channel not found" })
                };
            }
            console.log('Channel updated successfully');
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Channel updated successfully" })
            };
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to upload image" })
        };
    }
};

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

