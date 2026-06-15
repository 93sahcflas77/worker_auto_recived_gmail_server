const config = require('./config/env');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);


app.use(
  helmet({
    contentSecurityPolicy: false, //enable later carefully
    crossOriginEmbedderPolicy: false,
  }),
);


app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs");

app.use(
  '/static',
  express.static(path.join(process.cwd(), 'public'), {
    maxAge: '7d',
    etag: true,
    lastModified: true,
    setHeaders: (res, path_) => {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    },
    index: false,
  }),
);

app.use(
  express.json({
    limit: '10mb',
  }),
);
app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  }),
);

app.use("/", require("./routes/gmailAuth.routes"))


module.exports = app;
