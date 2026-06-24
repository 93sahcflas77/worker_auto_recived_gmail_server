const { Worker } = require("bullmq")
const workerConnection = require("../config/redisIo");
const attachementToOrthanc = require("../utils/attachementToOrthanc");

const attachementWorker = new Worker(
    "attachementQueue",
    async job => {


        const bucket = job.data.buckets;
        const attachement = job.data.attachements;
        const messageId = job.data.messageId;

        await attachementToOrthanc({bucket, attachement, messageId})
        
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

module.exports = attachementWorker