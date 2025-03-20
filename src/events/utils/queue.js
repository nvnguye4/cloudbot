const { Queue, Worker } = require("bullmq");
const { createClient } = require("redis");

const redisOptions =
{ 
    connection: 
    { 
        host: process.env.REDIS_HOST || '172.17.0.1',
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379
    } 
};

const taskQueue = new Queue("taskQueue", redisOptions);

const worker = new Worker("taskQueue", async (job) => 
{
    console.log(`👷 Processing job: ${job.id} with data:`, job.data);
    return `✅ Job ${job.id} processed with data: ${job.data}`;
}, redisOptions);

worker.on("failed", (job, err) => 
{
    console.error(`❌ Job ${job.id} failed:`, err);
});

module.exports = { taskQueue };