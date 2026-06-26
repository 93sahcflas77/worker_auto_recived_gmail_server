const helper = require("./helper");
const getDriveClient = require("../config/googleapis");
const config = require("../config/env");

module.exports = async ({ fileName, bucket, messageId }) => {

    const drive = await getDriveClient();

    const result = await helper.onlyFindFileNameDrive(drive, fileName);

    await Promise.all(

        result.map(async (fileName) => {

            const download = await helper.fileNameFindDriveToBuffer(drive, fileName);

            if (fileName.toLowerCase().endsWith(".rar")) {

                const rarBuffer = download.data

                await helper.driveToextractRarToOrthanc( drive, rarBuffer, messageId, bucket, fileName);

                return;
            }

            const upload = await helper.uploadZipOrthanc(download.data);

            const studyData = await helper.orthancPatientDataFetch(upload);

            await helper.uploadToMongodb(messageId, studyData);

            await helper.uploadZipToMinio(drive, fileName, bucket)

        })
    )
}