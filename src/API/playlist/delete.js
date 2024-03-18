const query = require('../../components/rdsConnection');

module.exports.handler = async (event) => {
    try {
        const programId = event.pathParameters.deleteProgramId;

        const result = await query(`DELETE FROM playlist WHERE programId = '${programId}'`);


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
