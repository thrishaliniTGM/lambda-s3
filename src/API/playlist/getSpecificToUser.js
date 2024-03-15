const query  = require('../../components/rdsConnection');

module.exports.handler = async (event) => {
    try {
        const userId = event.pathParameters.userId;
        const results = await query(`SELECT program.* FROM program JOIN playlist ON program.id = playlist.programId WHERE playlist.userId = ${userId}`);
        
        if (results.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "No programs found for this playlist" })
            };
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify(results)
        };
    } catch (error) {
        console.error('Error fetching programs for playlist:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch programs for playlist" })
        };
    }
};
