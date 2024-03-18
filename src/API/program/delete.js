const query  = require('../../components/rdsConnection');

module.exports.handler = async (event) => {
    try {
        const programId = event.body.programId;

        const result = await query(`DELETE FROM program WHERE id = ${programId}`);
       
        if (result.affectedRows === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Program not found" })
            };
        }

        console.log('Program deleted successfully');
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
