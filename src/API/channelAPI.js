


const multer = require('multer');
const connection = require('../components/rdsConnection');


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
            body: JSON.stringify({ error: error+ "Failed to fetch channels" })
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

module.exports.handler = async (event) => {
    try {
        const { httpMethod, path,pathParameters, body } = event;
        
        console.log("Hi");
        // let response;
        // response = "Hello from AWS lambda function"
        // return JSON.parse(response);

        let response = {
            statusCode: 200,
            // body: JSON.stringify('Hello, World!'),
            body: JSON.stringify(event),
        };
        // return response;
    // }
    // catch(error){

    //     console.log(error)
    //     return {

    //         status:500,
    //         error:error
    //     }
    // }
        switch (httpMethod) {
            case 'GET':
                if (path.startsWith("/channel/search")) {
                    const searchTerm = body ? JSON.parse(body).searchTerm : null;
                    response = await handleSearchChannel(searchTerm);
                }
               else if( pathParameters && pathParameters.id!="" ){
                    let channelId = pathParameters.id;
                    response = await handleGetChannelById(channelId);
                }
                else  {
                    response = await handleGetAllChannels();
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
                
            // case 'PATCH':
            
            //     try {
            //         return await handlePatchChannelImage(event);
            //     } catch (error) {
            //         console.error('Error:', error);
            //         return {
            //             statusCode: 500,
            //             body: JSON.stringify({ error: 'Internal Server Error' })
            //         };
            //     }
                
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
            body: JSON.stringify({ errorMessage: error })
        };
    }
};
