const query  = require('../../components/rdsConnection');

module.exports.handler = async (event) => {
    try {
        const { id, channelName, channelNumber } = event.body;

        let updateFields = '';
        if (channelName) {
            updateFields += `channelName = '${channelName}'`;
        }
        if (channelNumber) {
            if (channelName) updateFields += ', ';
            updateFields += `channelNumber = '${channelNumber}'`;
        }

        await query(`UPDATE channel SET ${updateFields} WHERE id = ${id}`);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Channel updated successfully" })
        };
    } catch (error) {
        console.error('Error updating channel:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to update channel" })
        };
    }
};
