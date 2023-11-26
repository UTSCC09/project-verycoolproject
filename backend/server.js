const express = require("express");

require("dotenv").config();
const http = require("http");
const app = express();

const server = http.createServer(app);
const socket = require("socket.io");
const cors = require('cors');
const connectToMongoDB = require("./mongodb/setup")

const { UserRoutes, RoomRoutes } = require('./router')

const User = require("./models/User");
const Room = require("./models/Rooms");
const words = require('./words');

const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: "*"
  }
})

const users = {};
const socketToRoom = {};


connectToMongoDB()

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);



app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use("/room", RoomRoutes);
app.use("/user", UserRoutes);

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
    const { message, roomId } = data
    console.log(message)
    console.log(roomId)

    io.to(roomId).emit('new_message', `${socket.id.substring(0, 5)}: ${message}`);
    console.log(socket.id)
    console.log('message sent')
  })

  socket.on('new-round', (data) => {
    const { roomId } = data
    console.log('new round')
    io.to(roomId).emit('new_word', `${words[Math.floor(Math.random() * words.length)].toLowerCase()}`);
    console.log('new word sent')
  })
})

server.listen(process.env.PORT || 4000, () => console.log('server is running on port 4000'));