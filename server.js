const express = require('express');
const errorHandler = require('./Middleware/errorHandler.js')
const dotenv = require('dotenv');
const { ConnectToDb } = require('./Db/db.js');
const routes = require('./routes');
const { setupMiddlewares } = require('./middlewares');
const { setupServer } = require('./serverSetup');
dotenv.config();
const app = express();
// Setup middlewares
setupMiddlewares(app);
// Routers
app.use(routes);
app.use(errorHandler);
ConnectToDb();
// Setup server and cluster
setupServer(app);
