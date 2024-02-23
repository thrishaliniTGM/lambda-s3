// 'use strict';

// module.exports.hello = async (event) => {
//   return {
//     statusCode: 200,
//     body: JSON.stringify(
//       {
//         message: 'Go Serverless v1.0! Your function executed successfully!',
//         input: event,
//       },
//       null,
//       2
//     ),
//   };

//   // Use this code if you don't use the http event with the LAMBDA-PROXY integration
//   // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
// };

const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKET_NAME;
module.exports.handler = async(event)=>{
  console.log(event);
  const response = {
    isBase64Encoded: false,
    statusCode : 200,
  
  };
  try{
    const parsedBody = JSON.parse(event.body);
    const base64File = parsedBody.file;
    const decodedFile = Buffer.from(base64File.replace(/^data.image\/\w+;base64,/,""),"base64");
    const params = {
      Bucket : BUCKET_NAME,
      Key: `images/${new Date().toISOString()}.jpeg`,
      Body: decodedFile,
      ContentType: "image/jpeg",
    };

    const uploadResult = await s3.upload(params).promise();
    response.body = JSON.stringify({message: "Successfully uploaded file to S3", uploadResult});
  }
  catch(e){
    console.error(e);
    response.body  = JSON.stringify ({message:"File upload failed", errorMessage:e});
    response.statusCode = 500;
  }
  return response;
}