const query  = require('../../components/rdsConnection');

module.exports.handler = async (event) => {
    try {
        const results = await query('SELECT * FROM program');
        if (results.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "No programs found" })
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify(results)
        };
    } catch (error) {
        console.error('Error fetching program:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch program" })
        };
    }
};
