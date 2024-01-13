// socket.js

const socketIo = require('socket.io');

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: ['https://kingjob.vercel.app','http://localhost:3000','https://kingjob.pro'], // Update with your frontend's URL or a more specific configuration
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection',(socket)=>{
    console.log(`User connected ${socket.id}`);

    socket.on('joinRoom',userId=>{
      socket.join(userId);
      console.log(userId+' joined room')
    })
    
  })
}


function getSocketInstance() {
  return io;
}

module.exports = { initializeSocket, getSocketInstance };