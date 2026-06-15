const { Worker } = require("bullmq")
const workerConnection = require("../config/redisIo");
const driveToMinio = require("../utils/driveToMinio")

const zipWorker = new Worker(
    "zipQueue",
    async job => {
        const fileName = job.data.fileName;
        const bucket = job.data.buckets

        await driveToMinio({fileName, bucket })
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