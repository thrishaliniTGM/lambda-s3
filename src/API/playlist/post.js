const  query  = require('../../components/rdsConnection');

module.exports.handler = async (event) => {
    try {
        const { playlistName, position, programId, userId } = event.body;

        if (!playlistName || !position || !programId || !userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "playlistName, position, programId, and userId are required" })
            };
        }

    
          
        const result = await query(`INSERT INTO playlist SET playlistName = '${playlistName}', position = '${position}', programId = ${programId}, userId = ${userId}`);

        console.log('Playlist added successfully');

        return {
            statusCode: 201,
            body: JSON.stringify({ message: "Playlist added successfully", playlistId: result.insertId })
        };
    } catch (error) {
        console.error('Error inserting playlist:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to add playlist" })
        };
    }
};
