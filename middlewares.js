const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const setupMiddlewares = (app) => {
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  // Serve static files
  app.use('/', express.static(path.join(__dirname, 'uploads')));
  app.use('/', express.static(path.join(__dirname, 'logos')));
  app.use('/', express.static(path.join(__dirname, 'userprofilepic')));
};
module.exports = { setupMiddlewares };
