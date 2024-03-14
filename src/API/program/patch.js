const query  = require('../../components/rdsConnection');

module.exports.handler = async (event) => {
    try {
        const programId = event.pathParameters.programId;
        const { programName, videoUrl } = event.body;

        const programData = {};
        if (programName) {
            programData.programName = programName;
        }
        if (videoUrl) {
            programData.videoUrl = videoUrl;
        }

        if (Object.keys(programData).length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "At least one of programName or videoUrl is required for update" })
            };
        }
        
        const result = await query(`UPDATE program SET programName = '${programData.programName}', videoUrl = '${programData.videoUrl}' WHERE id = ${programId}`);

        if (result.affectedRows === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Program not found" })
            };
        }

        console.log('Program updated successfully');
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Program updated successfully" })
        };
    } catch (error) {
        console.error('Error updating program:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to update program" })
        };
    }
};
