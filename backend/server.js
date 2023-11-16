const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const cors = require('cors');

const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: "*"
  }
})

const users = {};
const socketToRoom = {};

io.on(`connection`, socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log("Room ID: " + roomId + " | User ID: " + userId)
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
            console.log('disconnected')
        })
    })

         // Listening for a message event 
    socket.on('message', (data) => {
        console.log(data)
        io.emit('new_message', `${socket.id.substring(0, 5)}: ${data}`)
        console.log('message sent')
    })
})
//server.listen(process.env.PORT || 4000, () => console.log('server is running on port 4000'));
server.listen(4000, () => console.log('server is running on port 4000'));