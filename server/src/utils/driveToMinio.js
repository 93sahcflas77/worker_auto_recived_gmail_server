const { getDriveClient } = require("../config/googleapis");
const { client } = require("../config/minio");
const axios = require("axios")

module.exports = async ({ fileName, bucket, messageId }) => {

    const drive = await getDriveClient();

    const bucketName = bucket
        .replace(/\s*<.*?>/, '') // remove email
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

    const files = fileName.split(" ");
    const index = files.findIndex(v => v.toLowerCase().endsWith(".zip"));
    const result = [];

    if (index > 0) {
        let file = files[index];

        let fileCheck = await drive.files.list({
            q: `name='${file}' and trashed=false`,
            fields: "files(id,name,mimeType,size)"
        });

        // Not found, try previous token + zip
        if (!fileCheck.data.files.length) {
            file = `${files[index - 1]} ${file}`;

            fileCheck = await drive.files.list({
                q: `name='${file}' and trashed=false`,
                fields: "files(id,name,mimeType,size)"
            });
        }

        if (fileCheck.data.files.length) {
            result.push(fileCheck.data.files[0].name);
        } else {
            console.log("File not found");
        }
    }

    const exists = await client.bucketExists(bucketName);

    if (!exists) {
        await client.makeBucket(bucketName, "us-east-1");
    }

    await Promise.all(

        result.map(async (fileName) => {
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

        })
    )
}