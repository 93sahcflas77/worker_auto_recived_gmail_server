const axios = require("axios");
const Study = require("../models/study.model")
module.exports =  async ({bucketName, file_name, messageId}) => {

    const exists = await client.bucketExists(bucketName);
    const objectExits = await client.statObject(bucketName, file_name);

    if (!exists) {
        console.log("Bucket does not exist");
    }

    const stream = await client.getObject(
        bucketName,
        file_name
    )

    const response = await axios.post(
        "http://localhost:8042/instances",
        stream,
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
        downloadUrl:  `http://localhost:8042/studies/${orthancStudyId}/archive`,
        viewerUrl:  `http://localhost:8042/ohif/viewer?StudyInstanceUIDs=${study.data.MainDicomTags.StudyInstanceUID}`
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
