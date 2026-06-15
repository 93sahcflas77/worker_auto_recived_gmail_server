const Minio = require('minio');
const config = require('./env');
const logger = require('../utils/logger');

if (!config.MINIO.endpoint || !config.MINIO.accessKey || !config.MINIO.secretKey) {
  logger.error('MinIO config missing!');
  process.exit(1);
}
client = new Minio.Client({
  endPoint: config.MINIO.endpoint,
  port: config.MINIO.minio_port,
  useSSL: config.MINIO.useSsl,
  accessKey: config.MINIO.accessKey,
  secretKey: config.MINIO.secretKey,
});

const checkconnection = async () => {
  try {
    await client.listBuckets();
    logger.info('MinIO connected successfully');
  } catch (err) {
    logger.error('MinIO connection failed', err);
    process.exit(1);
  }
};

module.exports = { client, checkconnection };