const mongoose = require("mongoose");

const studySchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: true,
    },
    patientId: {
        type: String,
        required: true,
        index: true
    },
    patientName: {
        type: String,
        required: true,
        index: true
    },
    orthancPatientId: {
        type: String,
        required: true,
    },
    orthancStudyId: {
        type: String,
        required: true,
    },
    studyInstanceUID: {
        type: String,
        required: true,
        index: true
    },
    modality: {
        type: String,
        required: true,
        index: true
    },
    downloadUrl: {
        type: String,
        default: null
    },
    viewerUrl: {
        type: String,
        default: null
    },
    age: String,
    gender: String,
    studyDescriptin: {
        type: String,
        trim: true
    },
    clinicalHistory: {
        type: String,
        trim: true
    },
    imageCount: String,
    hospitalName: {
        type: String,
    },
    arrivalTime: {
        type: Date,
        index: true
    },
    status: {
        type: String,
        enum: ["UNASSIGNED",
            "ASSIGNED",
            "IN_PROGRESS",
            "REPORTED",
            "APPROVED",
            "REJECTED"],
        default: "UNASSIGNED",
        index: true
    },
    assginBy: {
        type: String,
        enum: ["chandan", "ravi", "tilak", "kavi"],
        required: false
    },
    create_at: {
        type: Date,
        default: Date.now()
    },
    update_at: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("Study", studySchema);