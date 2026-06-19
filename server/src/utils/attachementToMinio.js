const { client } = require("../config/minio");
const minioToOrthancToMongodb = require("../utils/minioToOrthancToMongo")

module.exports = async ({ bucket, attachement, messageId }) => {

    console.log("attachementToMinit runing......")

    const bucketName = bucket
        .replace(/\s*<.*?>/, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

    console.log(`bucketName: ${bucketName}`)

    await Promise.all(
        await attachement.map(async (v) => {

            console.log(`allattement: ${v}`)

            const buffer = Buffer.from(v.data, "base64")

            await client.putObject(
                bucketName,
                v.fileName,
                buffer,
                {
                    "Content-Type":
                        v.mimeType
                }
            )

            const file_name = v.fileName;

            await minioToOrthancToMongodb({bucketName, file_name, messageId})


            console.log("attachementToMinit end......")
        })
    )


}