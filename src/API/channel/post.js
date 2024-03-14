const query = require('../../components/rdsConnection');


module.exports.handler = async(event)=>{

    try {
        const channelName = event.body.channelName;
        const channelNumber = event.body.channelNumber;
        const results = await query(`INSERT INTO channel (channelName, channelNumber) VALUES ('${channelName}', '${channelNumber}')`);
        return {
            statusCode: 201,
            body: JSON.stringify({ message: "Channel added successfully", channelId: results.insertId })
        };
    } catch (error) {
        console.error('Error inserting channel:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to add channel" })
        };
    }
}