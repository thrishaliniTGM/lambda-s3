const query = require('../../components/rdsConnection');

module.exports.handler = async (event) => {
    try {
        const programId = event.pathParameters.programId;

        await query(`DELETE FROM playlist WHERE programId = '${programId}'`);

        const result = await query(`DELETE FROM program WHERE id = '${programId}'`);

        if (result.affectedRows === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Program not found" })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Program deleted successfully" })
        };
    } catch (error) {
        console.error('Error deleting program:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to delete program" })
        };
    }
};
