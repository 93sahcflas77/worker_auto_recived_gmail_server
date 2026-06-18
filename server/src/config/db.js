const mongoose = require('mongoose');
const logger = require('../utils/logger');
const config = require('./env');

const connectDB = async (retryCount = 0) => {
  try {
    if (!config.mongoUri) {
      logger.error('MONGO_URI is missing in environment variables.');
      process.exit(1);
    }

    logger.info('Connecting to MongoDB...');
    logger.info(`URI: ${config.mongoUri}`);

    const conn = await mongoose.connect(config.mongoUri, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info('MongoDB Connected Successfully!');
    logger.info(`Host: ${conn.connection.host}`);
    logger.info(`Database: ${conn.connection.name}\n`);

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB Disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB Reconnected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB Connection Error:', err.message);
    });
  } catch (error) {
    logger.error({
      message: 'Failed to connect to MongoDB',
      error: error.message,
      retryCount,
    });

    if (retryCount < 5) {
      logger.warn(`Retrying DB connection (${retryCount + 1}/5)...`);
      setTimeout(() => connectDB(retryCount + 1), 5000);
    } else {
      logger.error('Max retries reached. Exiting process.');
      process.exit(1);
    }
  }
};

module.exports = { connectDB };