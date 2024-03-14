const query  = require('../../components/rdsConnection');

module.exports.handler = async (event) => {
    try {
        const programId = event.pathParameters.programId;
        const newPlaylistName = event.body.playlistName;
        const newPosition = event.body.position;

        const result = await query(`UPDATE playlist SET playlistName = '${newPlaylistName}', position = '${newPosition}' WHERE programId = ${programId}`);

        if (result.affectedRows === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Program or playlist not found" })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Program playlist updated successfully" })
        };
    } catch (error) {
        console.error('Error updating program playlist:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to update program playlist" })
        };
    }
};
