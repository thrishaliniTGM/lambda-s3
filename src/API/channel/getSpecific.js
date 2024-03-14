const query = require('../../components/rdsConnection');

module.exports.handler = async (event) => {
    try {
        const channelId = event.pathParameters.id;
        const results = await query(`SELECT * FROM channel WHERE id = ${channelId}`);
        if (results.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Channel not found" })
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify(results[0])
        };
    } catch (error) {
        console.error('Error fetching channel:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch channel" })
        };
    }
}
