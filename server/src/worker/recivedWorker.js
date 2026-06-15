const { Worker } = require("bullmq")
const workerConnection = require("../config/redisIo");

const recivedWorker = new Worker(
    "recivedQueue",
    async job => {
        console.log(job.data)
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

module.exports = recivedWorker