const  query  = require('../../components/rdsConnection');

module.exports.handler = async (event) => {
    try {
        const { programName, videoUrl } = event.body;

        if (!programName || !videoUrl) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "programName and videoUrl are required" })
            };
        }

        const programData = { programName, videoUrl };

        const result = await query(`INSERT INTO program SET programName = '${programData.programName}' , videoUrl = '${programData.videoUrl}'`);

        console.log('Program added successfully');

        return {
            statusCode: 201,
            body: JSON.stringify({ message: "Program added successfully", programId: result.insertId })
        };
    } catch (error) {
        console.error('Error inserting program:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to add program" })
        };
    }
};
