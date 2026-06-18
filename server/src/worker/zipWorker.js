const { Worker } = require("bullmq")
const workerConnection = require("../config/redisIo");
const driveToMinio = require("../utils/driveToMinio")

const zipWorker = new Worker(
    "zipQueue",
    async job => {
        const fileName = job.data.fileName;
        const bucket = job.data.buckets;
        const messageId = job.data.messageId

        await driveToMinio({fileName, bucket, messageId })
    },
    {
        connection: workerConnection,
        lockDuration: 12000,
        stalledInterval: 5000,
        maxStalledCount: 2,
        drainDelay: 5,
        skipLockRenewal: false,
        skipStalledCheck: false,
        metrics: {
            maxDataPoints: 500
        }
    }

)

module.exports = zipWorker