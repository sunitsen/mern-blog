const s3 = new AWS.S3({
    region: 'AP-SOUTH-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const generateUploadURL = async () =>{
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.png`;
    return await s3.getSignedUrlPromise('putObject', {
        Bucket: 'peoject-name',
        key: imageName,
        ContentType: "image/jpge",
    })

}



