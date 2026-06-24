const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { client } = require("../config/minio");
const Study = require("../models/study.model");
const extractRarBuffer = require("./extractRarBuffer");
const getAllFiles = require("./getAllFiles");

module.exports = async ({ bucket, attachement, messageId }) => {

    await Promise.all(
        attachement.map(async (v) => {

            if (v.fileName.endsWith(".rar")) {

                const rarBuffer = Buffer.from(v.data.replace(/-/g, "+").replace(/_/g, "/"), "base64")

                const tempRarPath = path.join("/tmp", `${Date.now()}.rar`);
                const outputDir = path.join("/tmp", `extract-${Date.now()}`);
                console.log(`outputDir: ${outputDir}`);

                await extractRarBuffer(rarBuffer, tempRarPath, outputDir);

                const file = await fs.readdirSync(outputDir, {
                    recursive: true
                })
                // const files = await getAllFiles(outputDir);
                console.log(`files: ${files}`)

                const result = await Promise.all(
                    files.map(async (filePath) => {


                        const file = path.join(outputDir, filePath);
                        const dicomBuffer = fs.readFileSync(file);

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


                    })

                )

                fs.rmSync(outputDir, {
                    recursive: true,
                    force: true
                })

                fs.unlinkSync(tempRarPath);

                console.log(result);

                // const orthancPatientId = result.data[0].ParentPatient;
                // const orthancStudyId = result.data[0].ParentStudy;

                // const patient = await axios.get(`http://localhost:8042/patients/${orthancPatientId}`);

                // const study = await axios.get(`http://localhost:8042/studies/${orthancStudyId}`)

                // const seriesId = study.data.Series[0];
                // const series = await axios.get(`http://localhost:8042/series/${seriesId}`);
                // const modality = series.data.MainDicomTags.Modality;

                // const studyData = {
                //     patientId: patient.data.MainDicomTags.PatientID,
                //     patientName: patient.data.MainDicomTags.PatientName,
                //     orthancPatientId: orthancPatientId,
                //     orthancStudyId: orthancStudyId,
                //     studyInstanceUID: study.data.MainDicomTags.StudyInstanceUID,
                //     modality: modality,
                //     downloadUrl: `http://localhost:8042/studies/${orthancStudyId}/archive`,
                //     viewerUrl: `http://localhost:8042/ohif/viewer?StudyInstanceUIDs=${study.data.MainDicomTags.StudyInstanceUID}`
                // }

                // console.log(studyData);

                // await Study.create({
                //     messageId,
                //     patientId: studyData.patientId,
                //     patientName: studyData.patientName,
                //     orthancPatientId: studyData.orthancPatientId,
                //     orthancStudyId: studyData.orthancStudyId,
                //     studyInstanceUID: studyData.studyInstanceUID,
                //     modality: studyData.modality,
                //     downloadUrl: studyData.downloadUrl,
                //     viewerUrl: studyData.viewerUrl
                // })

            }

            if (v.fileName.endsWith(".zip")) {

                const buffer = Buffer.from(v.data, "base64")

                const file_name = v.fileName;

                const response = await axios.post(
                    "http://localhost:8042/instances",
                    buffer,
                    {
                        headers: {
                            "Content-Type": "application/zip"
                        },
                        maxBodyLength: Infinity,
                        maxContentLength: Infinity
                    }
                )

                const orthancPatientId = response.data[0].ParentPatient;
                const orthancStudyId = response.data[0].ParentStudy;

                const patient = await axios.get(`http://localhost:8042/patients/${orthancPatientId}`);

                const study = await axios.get(`http://localhost:8042/studies/${orthancStudyId}`)

                const seriesId = study.data.Series[0];
                const series = await axios.get(`http://localhost:8042/series/${seriesId}`);
                const modality = series.data.MainDicomTags.Modality;

                const studyData = {
                    patientId: patient.data.MainDicomTags.PatientID,
                    patientName: patient.data.MainDicomTags.PatientName,
                    orthancPatientId: orthancPatientId,
                    orthancStudyId: orthancStudyId,
                    studyInstanceUID: study.data.MainDicomTags.StudyInstanceUID,
                    modality: modality,
                    downloadUrl: `http://localhost:8042/studies/${orthancStudyId}/archive`,
                    viewerUrl: `http://localhost:8042/ohif/viewer?StudyInstanceUIDs=${study.data.MainDicomTags.StudyInstanceUID}`
                }


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

            }

            const bucketName = bucket.replace(/\s*<.*?>/, '').trim().toLowerCase().replace(/\s+/g, '-');
            const buffer = Buffer.from(v.data, "base64")
            const file_name = v.fileName;

            await client.putObject(
                bucketName,
                file_name,
                buffer,
                {
                    "Content-Type":
                        v.mimeType
                }
            )


        })
    )


}