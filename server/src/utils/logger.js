const winston = require('winston');
const config = require('../config/env');
const path = require('path');
const fs = require('fs');

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const customLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  http: 3,
  info: 4,
  debug: 5,
};

const customColors = {
  fatal: 'red',
  error: 'red',
  warn: 'yellow',
  http: 'magenta',
  info: 'green',
  debug: 'blue',
};

winston.addColors(customColors);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service }) => {
    return `${timestamp} | ${level.padEnd(5)} | ${service} | ${message}`;
  }),
);

module.exports = winston.createLogger({
  levels: customLevels,
  level: config.nodeEnv === 'production' ? 'info' : 'debug',

  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),

  transports: [
    new winston.transports.Console({
      level: 'info',
      format: consoleFormat,
    }),
    new winston.transports.File({
      level: 'error',
      filename: `${logDir}/winstonError.log`,
    }),
    new winston.transports.File({
      filename: `${logDir}/combined.log`,
    }),
    new winston.transports.Http({
      host: 'localhost',
      port: 3000,
      path: '/logs',
      ssl: false,
      format: winston.format.json(),
      headers: {
        'Content-Type': 'application/json',
      },
      batch: true,
      batchCount: 5,
      batchInterval: 2000,
      timeout: 5000,
    }),
  ],
  defaultMeta: {
    service: 'api-service',
  },
  exceptionHandlers: [new winston.transports.File({ filename: `${logDir}/exceptions.log` })],
  rejectionHandlers: [new winston.transports.File({ filename: `${logDir}/rejections.log` })],
  exitOnError: false,
});
