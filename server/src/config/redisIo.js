const config = require('./env');
const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisConfig = {
  host: config.REDIS.redisHost,
  port: config.REDIS.redisPort,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    logger.warn(`Redis reconnect attempt #${times}. Retrying in ${delay}ms`);
    return delay;
  },
  reconnectOnError(error) {
    logger.error(`Redis reconnectOnError: ${error.message}`);
    return true;
  },
};

const workerConnection = new Redis({
  ...redisConfig,
  maxRetriesPerRequest: null,
});

workerConnection.on('ready', () => {
  logger.info('Redis connection established');
});

workerConnection.on('error', (err) => {
  logger.error(`Redis error: ${err.message}`);
});

workerConnection.on('close', () => {
  logger.warn('Redis connection closed');
});

workerConnection.on('reconnecting', (delay) => {
  logger.warn(`Redis reconnecting in ${delay}ms`);
});

workerConnection.on('end', () => {
  logger.error('Redis connection ended');
});

module.exports = workerConnection;
