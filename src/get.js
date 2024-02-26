const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKET_NAME;

module.exports.handler =async(event) =>{
    console.log(event);
    const response = {
        isBase64Encoded: false,
        statusCode :200,
        // Expires: 360
    };

    try {
        const key = decodeURIComponent(event.pathParameters.imageKey);
        const signedUrlExpireSeconds = 60*3 ;
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Expires: signedUrlExpireSeconds// URL expiration time in seconds (1 hour in this case)
        };
        const url = s3.getSignedUrl('getObject',params)
        // const signedUrl = await s3.getSignedUrlPromise('getObject', params);
        response.body = JSON.stringify({ message: "Successfully retrived image from S3", url });
    }
    catch(e){
        console.error(e);
        response.body = JSON.stringify({message:"Error in file retrival from s3", errorMessage : e });
        response.status = 500;
    };

    return response;
};