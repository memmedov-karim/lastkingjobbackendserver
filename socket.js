// socket.js

const socketIo = require('socket.io');

let io;
const connectedUsers = {};
function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: ['https://kingjob.vercel.app','http://localhost:3000','https://kingjob.pro','https://king-job.vercel.app'],
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection',(socket)=>{
    console.log(`User connected ${socket.id}`);

    socket.on('joinRoom',userId=>{
      socket.join(userId);
      connectedUsers[userId] = socket.id;
      console.log(userId+' joined room');
      io.emit('onlineUsers', Object.keys(connectedUsers));
    });

    socket.on('disconnect', () => {
      const disconnectedUser = Object.keys(connectedUsers).find((key) => connectedUsers[key] === socket.id);
      if (disconnectedUser) {
        delete connectedUsers[disconnectedUser];
        // io.emit('onlineUsers', Object.keys(connectedUsers));
      }
      console.log(`User disconnected ${socket.id}`);
    });
  })
}


function getSocketInstance() {
  return io;
}
function getConnectedUsers() {
  return connectedUsers;
}
module.exports = { initializeSocket, getSocketInstance,getConnectedUsers };