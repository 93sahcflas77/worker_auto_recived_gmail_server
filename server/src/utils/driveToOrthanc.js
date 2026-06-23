const { getDriveClient } = require("../config/googleapis");
const Study = require("../models/study.model")

const axios = require("axios")

module.exports = async ({ fileName, bucket, messageId }) => {

    const drive = await getDriveClient();
    
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

    console.log(result)

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


            const res = await axios.post(
                "http://localhost:8042/instances",
                download.data,
                {
                    headers: {
                        "Content-Type": "application/zip"
                    },
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity
                }
            )

            const orthancPatientId = res.data[0].ParentPatient;
            const orthancStudyId = res.data[0].ParentStudy;

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

        })
    )
}