const http = require('http');
const cluster = require('cluster');
const os = require('os');
const { initializeSocket } = require('./socket.js');
const setupServer = (app) => {
  const server = http.createServer(app);
  const numCPUs = os.cpus().length;
  if (cluster.isMaster && process.env.NODE_ENV === 'production') {
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  } else {
    initializeSocket(server);
    const port = process.env.PORT;
    server.listen(port, () => {
      console.log(`Worker ${process.pid} is running on port ${port}`);
    });
  }
};

module.exports = { setupServer };
