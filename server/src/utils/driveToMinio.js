const { getDriveClient } = require("../config/googleapis");
const { client } = require("../config/minio");

module.exports = async ({fileName, bucket}) => {

    const drive = await getDriveClient();

    const bucketName = bucket
    .replace(/\s*<.*?>/, '') // remove email
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

    const files = fileName.match(/\S+\.[a-z0-9]+/gi) || [];

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
                file.name,
                download.data,
                {
                    "Content-Type":
                        file.mimeType
                }
            )

        })
    )
}