// socket.js

const socketIo = require('socket.io');

let io;
const connectedUsers = {};
const usersinexam = {};
function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: ['https://www.kingjob.pro','http://localhost:3000','https://clownfish-app-t2clr.ondigitalocean.app','http://localhost:45678'],
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
    socket.on('joinExam',data=>{
      const {name} = data;
      usersinexam[name] = socket.id;
      console.log(name+" joined exam")
    })
    socket.on('disconnect', () => {
      const disconnectedUser = Object.keys(connectedUsers).find((key) => connectedUsers[key] === socket.id);
      if (disconnectedUser) {
        delete connectedUsers[disconnectedUser];
        // io.emit('onlineUsers', Object.keys(connectedUsers));
      }
      const disconnetedUserFromExam = Object.keys(usersinexam).find((key) => usersinexam[key] === socket.id);
      if(disconnetedUserFromExam){
        console.log(disconnetedUserFromExam+"left from exam");
        delete usersinexam[disconnetedUserFromExam];
        
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
