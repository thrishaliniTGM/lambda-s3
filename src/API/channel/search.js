const query = require('../../components/rdsConnection');

module.exports.handler = async (event) => {
    try {
        const searchTerm = event.pathParameters.searchTerm;
        if (!searchTerm) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "searchTerm parameter is required" })
            };
        }

        const sqlQuery = `SELECT * FROM channel WHERE channelName REGEXP '${searchTerm}' OR channelNumber REGEXP '${searchTerm}' `;
        // const sqlParams = [searchTerm, searchTerm];

        const results = await query(sqlQuery);
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
