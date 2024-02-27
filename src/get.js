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

  try {
    const token = event.headers.Authorization;
    const decodedToken = await verifyToken(token, SECRET_KEY);

    console.log("Token verification succeeded:", decodedToken);

    const key = decodeURIComponent(event.pathParameters.imageKey);
    const signedUrlExpireSeconds = 60 * 3;
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: signedUrlExpireSeconds,
    };
    const url = s3.getSignedUrl("getObject", params);

    response.body = JSON.stringify({
      message: "Successfully retrived image from S3",
      url,
    });
  } catch (error) {
    console.error(error);

    response.body = JSON.stringify({
      message: "Error in file retrieval from S3",
      errorMessage: error.message,
    });

    response.statusCode = error.name === "JsonWebTokenError" ? 401 : 500;
  }

  return response;
};
