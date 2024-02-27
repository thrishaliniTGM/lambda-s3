const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const jwt = require("jsonwebtoken");

const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKET_NAME;
const SECRET_KEY = "TGM-thrish";
module.exports.handler = async (event) => {
  console.log(event);
  const response = {
    isBase64Encoded: false,
    statusCode: 200,
    // Expires: 360
  };
  const verifyToken = (token, secretKey) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (err, decoded) => {
                if (err) {
                    reject(err); // If verification fails, reject the Promise with the error
                } else {
                    resolve(decoded); // If verification succeeds, resolve the Promise with the decoded token payload
                }
            });
        });
    };
    const token = event.headers.Authorization;
    verifyToken(token, SECRET_KEY)
    .then(decodedToken => {
        console.log('Token verification succeeded:', decodedToken);
            try {
              const key = decodeURIComponent(event.pathParameters.imageKey);
              const signedUrlExpireSeconds = 60 * 3;
              const params = {
                Bucket: BUCKET_NAME,
                Key: key,
                Expires: signedUrlExpireSeconds,
              };
              const url = s3.getSignedUrl("getObject", params);
              // const signedUrl = await s3.getSignedUrlPromise('getObject', params);
              response.body = JSON.stringify({
                message: "Successfully retrived image from S3",
                url,
              });
            } catch (e) {
              console.error(e);
              response.body = JSON.stringify({
                message: "Error in file retrival from s3",
                errorMessage: e,
              });
              response.status = 500;
            }
          
    })
    .catch(error => {
        response.body = JSON.stringify({
            message: "authentication fail",
            errorMessage: error,
          });
          response.status = 401;
    });

   

  return response;
};
