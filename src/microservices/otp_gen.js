const axios = require('axios');

module.exports.handler = async (event) => {
    try {
        const number = event.pathParameters.number;
        if (number){
        let link = 'https://2factor.in/API/V1/d15a118a-e05b-11ee-8cbb-0200cd936042/SMS/'+ number + '/AUTOGEN2/OTP1';
        
        const response = await axios.get(link);

        return {
            statusCode: 200,
            body: JSON.stringify(response.data)
        };
        }
        else{  
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid parameters" })
            };
        }
    } catch (error) {
        console.error('Error calling external API:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to call external API" })
        };
    }
};
