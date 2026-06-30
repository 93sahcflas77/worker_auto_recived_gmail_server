const helper = require('./helper');
const getDriveClient = require('./getDriveClient');
const GoogleTolen = require('../models/googleToken.model');
const config = require('../config/env');

module.exports = async ({ fileName, bucket, messageId }) => {
  const accounts = await GoogleTolen.find({ email: config.clientgmail });

  await Promise.all(
    accounts.map(async (account) => {
      const drive = await getDriveClient(account.refreshToken);

      const result = await helper.onlyFindFileNameDrive(drive, fileName);
      console.log(`result: ${result}`);

      await Promise.all(
        result.files.map(async (file) => {
          const fileName = file.name;
          console.log(`fileName: ${fileName}`);

          if (fileName.toLowerCase().endsWith('.rar')) {
            const rarBuffer = await helper.fileNameFindDriveToRarArrayBuffer(drive, fileName);

            console.log(Buffer.isBuffer(rarBuffer)); // true

            await helper.driveToextractRarToOrthanc(drive, rarBuffer, messageId, bucket, fileName);

            return;
          }

          const download = await helper.fileNameFindDriveToBuffer(drive, fileName);

          const upload = await helper.uploadZipOrthanc(download.data);

          console.log(upload);

          const studyData = await helper.orthancPatientDataFetch(upload);

          await helper.uploadToMongodb(messageId, studyData);

          await helper.uploadZipToMinio(drive, fileName, bucket);
        }),
      );
    }),
  );
};
