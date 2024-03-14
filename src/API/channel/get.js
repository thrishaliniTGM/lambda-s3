const query = require('../../components/rdsConnection');



module.exports.handler = async (event) => { 
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