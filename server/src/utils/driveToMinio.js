const { getDriveClient } = require("../config/googleapis");
const minioToOrthancToMongodb = require("../utils/minioToOrthancToMongo");
const { client } = require("../config/minio");
const axios = require("axios")

module.exports = async ({ fileName, bucket, messageId }) => {

    console.log(`driveToMinio starting ..........`)

    const drive = await getDriveClient();

    const bucketName = bucket
        .replace(/\s*<.*?>/, '') // remove email
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

    console.log(`bucketName: ${bucketName}`)

    const files = fileName.match(/[A-Za-z0-9_-]+\s\d+\.zip/);

    console.log(`files: ${files}`)

    const exists = await client.bucketExists(bucketName);

    if (!exists) {
        await client.makeBucket(bucketName, "us-east-1");
    }

    await Promise.all(

        files.map(async (fileName) => {
            const response = await drive.files.list({
                q: `name='${fileName}'`,
                fields: "files(id,name,mimeType,size)"
            })

            if (!response.data.files.length) {
                console.log("File not found");
                return;
            }

            const file = response.data.files[0];
            const file_name = file.name

            const download = await drive.files.get({
                fileId: file.id,
                alt: "media"
            },
                {
                    responseType: "stream"
                }
            )

            await client.putObject(
                bucketName,
                file_name,
                download.data,
                {
                    "Content-Type": file.mimeType
                }
            )

            console.log("file upload a minio");

            await minioToOrthancToMongodb({bucketName, file_name, messageId })

            console.log(`driveToMinio end ..........`)

        })
    )
}