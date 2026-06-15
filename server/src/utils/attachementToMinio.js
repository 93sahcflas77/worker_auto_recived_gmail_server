const { client } = require("../config/minio");

module.exports = async ({ bucket, attachement }) => {

    const bucketName = bucket
        .replace(/\s*<.*?>/, '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');

    await Promise.all(
        await attachement.map(async (v) => {

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
        })
    )


}