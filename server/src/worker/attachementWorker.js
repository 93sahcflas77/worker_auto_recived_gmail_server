const { Worker } = require("bullmq")
const workerConnection = require("../config/redisIo");
const attachementToMinio = require("../utils/attachementToMinio");

const attachementWorker = new Worker(
    "attachementQueue",
    async job => {

        console.log(`attachement worker runing ..........`)

        const bucket = job.data.buckets;
        const attachement = job.data.attachements;
        const messageId = job.data.messageId;

        console.log(`bucket: ${bucket}`)
        console.log(`attachement: ${attachement}`)

        await attachementToMinio({bucket, attachement, messageId})

        console.log(`attachement worker end ..........`)
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