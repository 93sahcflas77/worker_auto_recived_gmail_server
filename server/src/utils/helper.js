const fs = require("fs");
const path = require("path");
const config = require("../config/env");
const { spawn } = require("child_process");
const Study = require("../models/study.model")
const axios = require("axios");
const logger = require("./logger");
const { client } = require("../config/minio");

const tempRarPath = path.join("/home/tony/worker_auto_recived_gmail_server/tmp", `${Date.now()}.rar`);
const outPutDir = path.join("/home/tony/worker_auto_recived_gmail_server/tmp", `extract-${Date.now()}`);

module.exports = {
    extractRarBuffer: function (rarBuffer) {
        return new Promise((resolve, reject) => {
            fs.mkdirSync(outPutDir, {
                recursive: true
            })
            fs.writeFileSync(tempRarPath, rarBuffer);
            const unrar = spawn(
                "unrar",
                [
                    "x",
                    "-o+",
                    tempRarPath,
                    outPutDir
                ]
            );
            let errorOutput = "";
            unrar.stderr.on("data", (data) => {
                errorOutput += data.toString();
            })
            unrar.on("close", (code) => {
                if (code !== 0) {
                    return reject(
                        new Error(
                            `UNRAR ERROR: ${errorOutput}`
                        )
                    )
                }
            })
            resolve();
        })
    },
    extractZipBuffer: function (zipBuffer) {
        return new Promise((resolve, reject) => {

            fs.mkdirSync(outPutDir, {
                recursive: true
            });

            fs.writeFileSync(tempRarPath, zipBuffer);

            const unzip = spawn("unzip", [
                "-o",
                tempRarPath,
                "-d",
                outPutDir
            ]);

            let stderr = "";


            unzip.stderr.on("data", (data) => {
                stderr += data.toString();
            });

            unzip.on("close", (code) => {

                if (code !== 0) {
                    return reject(new Error(stderr));
                }

                resolve(outPutDir);

            });
            unzip.on("error", reject);

        });
    },
    uploadZipOrthanc: async function (bufferData) {
        try {
            const response = await axios.post(
                "http://localhost:8042/instances",
                bufferData,
                {
                    headers: {
                        "Content-Type": "application/zip"
                    },
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity
                }
            )

            return response.data
        } catch (error) {
            console.log(error);
        }
    },
    uploadDicomOrthanc: async function (dicomBuffer) {
        try {
            const response = await axios.post(
                "http://localhost:8042/instances",
                dicomBuffer,
                {
                    headers: {
                        "Content-Type": "application/dicom"
                    },
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity
                }
            )

            return response.data
        } catch (error) {
            console.log(error);
        }
    },
    driveToextractRarToOrthanc: async function (drive, rarBuffer, messageId, bucket, fileName) {

        await this.extractRarBuffer(rarBuffer);

        const files = await fs.readdirSync(outPutDir, {
            recursive: true
        })

        const upload = await Promise.all(
            files.map(async (filePath) => {

                const file = path.join(outPutDir, filePath);
                const dicomBuffer = fs.readFileSync(file);

                return await this.uploadDicomOrthanc(dicomBuffer)

            })
        )

        const studyData = await this.orthancPatientDataFetch(upload);

        await this.uploadToMongodb(messageId, studyData);

        await this.uploadZipToMinio(drive, fileName, bucket)


        fs.rmSync(outPutDir, {
            recursive: true,
            force: true
        })

        fs.unlinkSync(tempRarPath);

    },
    attachmentToRarExtractToOrthanc: async function (rarBuffer, file_name, messageId, bucket) {

        await this.extractRarBuffer(rarBuffer);

        const files = await fs.readdirSync(outPutDir, {
            recursive: true
        })

        const upload = await Promise.all(
            files.map(async (filePath) => {

                const file = path.join(outPutDir, filePath);
                const dicomBuffer = fs.readFileSync(file);

                return await this.uploadDicomOrthanc(dicomBuffer)

            })
        )

        const studyData = await this.orthancPatientDataFetch(upload);

        await this.uploadToMongodb(messageId, studyData);

        await this.uploadZipToMinio(drive, file_name, bucket)


        fs.rmSync(outPutDir, {
            recursive: true,
            force: true
        })

        fs.unlinkSync(tempRarPath);
    },
    uploadZipToMinio: async function (drive, fileName, bucket) {
        try {
            const bucketName = bucket.replace(/\s*<.*?>/, '').trim().toLowerCase().replace(/\s+/g, '-');
            const exists = await client.bucketExists(bucketName);

            if (!exists) {
                await client.makeBucket(bucketName, "us-east-1");
            }

            const download = await this.fileNameFindDriveToBuller(drive, fileName);

            await client.putObject(
                bucketName,
                fileName,
                download.data,
                {
                    "Content-Type": "application/zip"
                }
            )

        } catch (error) {
            console.log(error)
        }
    },
    uploadAttachementTominio: async function (bucket, fileName, buffer, mimeType) {
        try {
            const bucketName = bucket.replace(/\s*<.*?>/, '').trim().toLowerCase().replace(/\s+/g, '-');
            const exists = await client.bucketExists(bucketName);

            if (!exists) {
                await client.makeBucket(bucketName, "us-east-1");
            }

            await client.putObject(
                bucketName,
                fileName,
                buffer,
                {
                    "Content-Type": `${mimeType}`
                }
            )

        } catch (error) {
            console.log(error)
        }
    },
    fileNameFindDriveToBuffer: async function (drive, fileName) {
        try {
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

            return download

        } catch (error) {
            console.log(error)
        }
    },
    onlyFindFileNameDrive: async function (drive, fileName) {
        try {
            const files = fileName.split(" ");
            const index = files.findIndex(v => v.toLowerCase().endsWith(".zip"));
            if (index === -1) {
                return null
            }

            let file = files[index];

            let fileCheck = await drive.files.list({
                q: `name='${file}' and trashed=false`,
                fields: "files(id,name,mimeType,size)"
            });

            if (!fileCheck.data.files.length && index > 0) {
                file = `${files[index - 1]} ${file}`;

                fileCheck = await drive.files.list({
                    q: `name='${file}' and trashed=false`,
                    fields: "files(id,name,mimeType,size)"
                });
            }

            if (!fileCheck.data.files.length) {
                return null
            }

            return fileCheck.data

        } catch (error) {
            console.log(error)
        }
    },
    orthancPatientDataFetch: async function (upload) {
        try {

            const orthancPatientId = upload.data[0].ParentPatient;
            const orthancStudyId = upload.data[0].ParentStudy;

            const patient = await axios.get(`http://localhost:8042/patients/${orthancPatientId}`);

            const study = await axios.get(`http://localhost:8042/studies/${orthancStudyId}`)

            const seriesId = study.data.Series[0];
            const series = await axios.get(`http://localhost:8042/series/${seriesId}`);
            const modality = series.data.MainDicomTags.Modality;

            return {
                patientId: patient.data.MainDicomTags.PatientID,
                patientName: patient.data.MainDicomTags.PatientName,
                orthancPatientId: orthancPatientId,
                orthancStudyId: orthancStudyId,
                studyInstanceUID: study.data.MainDicomTags.StudyInstanceUID,
                modality: modality,
                downloadUrl: `http://localhost:8042/studies/${orthancStudyId}/archive`,
                viewerUrl: `http://localhost:8042/ohif/viewer?StudyInstanceUIDs=${study.data.MainDicomTags.StudyInstanceUID}`
            }

        } catch (error) {
            console.log(error)
        }
    },
    uploadToMongodb: async function (messageId, studyData) {
        try {
            await Study.create({
                messageId,
                patientId: studyData.patientId,
                patientName: studyData.patientName,
                orthancPatientId: studyData.orthancPatientId,
                orthancStudyId: studyData.orthancStudyId,
                studyInstanceUID: studyData.studyInstanceUID,
                modality: studyData.modality,
                downloadUrl: studyData.downloadUrl,
                viewerUrl: studyData.viewerUrl
            })
        } catch (error) {
            console.log(error)
        }
    },
}