// Importing modules using ESM syntax
import express from "express";
import { config as dotenvConfig } from "dotenv";
import http from "http";
import { createServer } from "http";
import { Server as socketIO } from "socket.io";
import cors from "cors";
import session from "express-session";

// Configuring environment variables
dotenvConfig();

// Importing a CommonJS module
import { connectToMongoDB } from "./mongodb/setup.js";

// Importing named exports
import { UserRoutes, RoomRoutes } from './router/index.js';
import { words } from './words.js';


// Creating an Express app
const app = express();
const server = createServer(app);

// Connecting to MongoDB
connectToMongoDB();

const io = new socketIO(server, {
  cors: {
    origin: [process.env.FRONTEND],
    methods: "*",
  },
});

const users = {};
const socketToRoom = {};


app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND);
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});


app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
    name: 'sessionId',
    cookie: {
      httpOnly: true, // Set the HttpOnly flag
      sameSite: 'strict',
    }
  })
);




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