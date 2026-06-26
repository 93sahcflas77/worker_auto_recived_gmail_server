const path = require("path");
const fs = require("fs");
const config = require("../config/env");
const helper = require("./helper");
const { imageToDicom, pdfToDicom, updateDicomMetaData, validate } = require("./convertDicom");

const outPutDir = "/home/tony/worker_auto_recived_gmail_server/tmp";

module.exports = async ({ bucket, attachement, messageId }) => {

        await Promise.all(
        attachement.map(async (v) => {

            if (v.fileName.toLowerCase().endsWith(".rar")) {

                const mb = v.size / (1024 * 1024);

                if (mb.toFixed(2) < 10) {
                    const raraBuffer = Buffer.from(v.data.replace(/-/g, "+").replace(/_/g, "/"), "base64");
                    const file_name = v.fileName;
                    const mimeType = v.mimeType;

                    await helper.extractRarBuffer(raraBuffer);

                    const files = await fs.readdirSync(config.rarExtractOutputDir, {
                        recursive: true
                    })

                    await Promise.all(
                        files.map(async (filePath) => {

                            const file = path.join(this.outPutDir, filePath);

                            const ext = path.extname(file).toLowerCase();
                            let dicomfile = file;

                            if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
                                dicomfile = file.replace(ext, ".dcm");

                                await imageToDicom(file, dicomfile);
                            } else if (ext === ".pdf") {
                                dicomfile = file.replace(ext, ".dcm");

                                await pdfToDicom(file, dicomfile);
                            } else if (ext === ".dcm") {
                                return;
                            }

                            await updateDicomMetaData(dicomfile, v.fileName);

                            await validate(dicomfile);

                            const buffer = fs.readFileSync(dicomfile);

                            const upload = await helper.uploadDicomOrthanc(buffer);

                            const studyData = await helper.orthancPatientDataFetch(upload);

                            await helper.uploadToMongodb(messageId, studyData);

                            await helper.uploadAttachementTominio(bucket, file_name, raraBuffer, mimeType)

                            return;

                        })
                    )
                }

                const rarBuffer = Buffer.from(v.data.replace(/-/g, "+").replace(/_/g, "/"), "base64");

                const file_name = v.fileName

                await helper.attachmentToRarExtractToOrthanc(rarBuffer, file_name, messageId, bucket)

            }

            if (v.fileName.toLowerCase().endsWith(".zip")) {

                const mb = v.size / (1024 * 1024);

                if (mb.toFixed(2) < 10) {
                    const zipBuffer = Buffer.from(v.data, "base64");
                    const file_name = v.fileName;
                    const mimeType = v.mimeType;

                    await helper.extractZipBuffer(zipBuffer);

                    const files = await fs.readdirSync(outPutDir, {
                        recursive: true
                    })

                    await Promise.all(
                        files.map(async (filePath) => {

                            const file = path.join(outPutDir, filePath);

                            const ext = path.extname(file).toLowerCase();
                            let dicomfile = file;

                            if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
                                dicomfile = file.replace(ext, ".dcm");

                                await imageToDicom(file, dicomfile);
                            } else if (ext === ".pdf") {
                                dicomfile = file.replace(ext, ".dcm");

                                await pdfToDicom(file, dicomfile);
                            } else if (ext !== ".dcm") {
                                dicomfile = file
                            } 

                            await updateDicomMetaData(dicomfile, v.fileName);

                            await validate(dicomfile);

                            const buffer = fs.readFileSync(dicomfile);

                            const upload = await helper.uploadDicomOrthanc(buffer);

                            const studyData = await helper.orthancPatientDataFetch(upload);

                            await helper.uploadToMongodb(messageId, studyData);

                            await helper.uploadAttachementTominio(bucket, file_name, zipBuffer, mimeType)

                            return;

                        })
                    )
                }

                const buffer = Buffer.from(v.data, "base64");
                const file_name = v.fileName;
                const mimeType = v.mimeType;

                const upload = await helper.uploadZipOrthanc(buffer);

                const studyData = await helper.orthancPatientDataFetch(upload);

                await helper.uploadToMongodb(messageId, studyData);

                await helper.uploadAttachementTominio(bucket, file_name, buffer, mimeType)

                return;

            }

            const buffer = Buffer.from(v.data, "base64")
            const file_name = v.fileName;
            const mimeType = v.mimeType;

            await helper.uploadAttachementTominio(bucket, file_name, buffer, mimeType)

        })
    )


}