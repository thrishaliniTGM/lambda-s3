const query = require('../../components/rdsConnection');

module.exports.handler = async (event) => {
    try {
        const playlistId = event.pathParameters.playlistId;
        const programId = event.pathParameters.programId;

        const result = await query(`DELETE FROM playlist WHERE id = '${playlistId}' AND programId = '${programId}'`);


        if (result.affectedRows === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Program from playlist not found" })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Program from playlist deleted successfully" })
        };
    } catch (error) {
        console.error('Error deleting program from playlist', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to delete program from playlist" })
        };
    }
};
