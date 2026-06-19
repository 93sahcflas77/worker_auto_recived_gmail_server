const { Worker } = require("bullmq")
const workerConnection = require("../config/redisIo");
// const recived = require("../test");

const recivedWorker = new Worker(
    "recivedQueue",
    async job => {

        console.log(`recvedWorker start .......`)

        const data = job.data
        // await recived(data);
        console.log(data);

        console.log(`recvedWorker end .......`)
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