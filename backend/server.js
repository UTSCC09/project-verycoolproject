const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);


app.use(cors());

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Replace with your frontend URL
    methods: '*',
  },
});


io.on('connection', (socket) => {
  socket.on('join-room', ({ room }) => {
    socket.join(room);

    socket.on('offer', (data) => {
      socket.to(room).emit('new-peer', { signal: data });
    });

    socket.on('disconnect', () => {
      socket.leave(room);
    });
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});