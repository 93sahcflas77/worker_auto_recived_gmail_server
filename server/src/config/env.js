const env = process.env.NODE_ENV || 'development';

require('dotenv').config({
  path: `.env.${env}`,
});

module.exports = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  baseUrl: process.env.BASE_URL,
  mongoUri: process.env.MONGO_URI,
  tmpRarPath: process.env.TEMP_RAR_PATH,
  rarExtractOutputDir: process.env.RAR_EXTRACT_OUTPUT_DIR,
  REDIS: {
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT
  },
  MINIO: {
    endpoint: process.env.MINIO_ENDPOINT,
    minio_port: process.env.MINIO_PORT,
    useSsl: process.env.MINIO_USESSL === "true",
    accessKey: process.env.MINIO_ACCESSKEY,
    secretKey: process.env.MINIO_SECRETKEY
  }
};
