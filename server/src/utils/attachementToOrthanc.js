const axios = require("axios");
const { client } = require("../config/minio");
const Study = require("../models/study.model")

module.exports = async ({ bucket, attachement, messageId }) => {

    await Promise.all(
        attachement.map(async (v) => {

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

        })
    )


}