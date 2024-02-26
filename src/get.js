const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKET_NAME;

module.exports.handler =async(event) =>{
    console.log(event);
    const response = {
        isBase64Encoded: false,
        statusCode :200,
        Expires: 360
    };

    try{
        const params = {
            Bucket: BUCKET_NAME,
            Key: decodeURIComponent(event.pathParameters.imageKey),

        };
    
        const getResult =  await s3.getSignedUrlPromise('getObject', params);
        response.body = JSON.stringify({message:"Successfully retrived file from s3",getResult});
        
    }
    catch(e){
        console.error(e);
        response.body = JSON.stringify({message:"Error in file retrival from s3", errorMessage : e });
        response.status = 500;
    };

    return response;
};