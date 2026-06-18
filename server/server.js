const config = require('./src/config/env');
const logger = require('./src/utils/logger');
const app = require('./src/app');
const { checkconnection } = require("../server/src/config/minio");
const { connectDB } = require("./src/config/db")

require("./src/worker/attachementWorker");
require("./src/worker/recivedWorker");
require("./src/worker/zipWorker");

const startServer = async () => {
  try {

    await checkconnection();
    await connectDB();

    app.listen(config.port, () => {
      logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
