// Importing modules using ESM syntax
import express from "express";
import { config as dotenvConfig } from "dotenv";
import http from "http";
import { createServer } from "http";
import { Server as socketIO } from "socket.io";
import cors from "cors";
import session from "express-session";
import { User } from "./models/User.js";
import { Room } from "./models/Rooms.js";

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
    origin: process.env.FRONTEND,
    methods: "*",
  },
});

const users = {};



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
  socket.on('join-room', (roomId, userId, username) => {

    console.log("Room ID: " + roomId + " | User ID: " + userId + " | username " + username)
    socket.join(roomId)
    socket.to(roomId).emit('user-connected', {
      id: userId,
      username: username,
      score: 0,
      rank: 0,
      correct: 0,
    });

    socket.on('disconnect', (async () => {
      console.log("disconnected")
      try {
        socket.to(roomId).emit('user-disconnected', { userId: userId, username: username })

        const room = await Room.findById(roomId);
        if (room) {

          if (room.players.length === 0) {
            await room.deleteOne({ _id: roomId });
            return;
          }

          // Remove the user from the players array
          const index = room.players.indexOf(userId);
          if (index !== -1) {
            room.players.splice(index, 1);
          }
          // Save the updated room
          await room.save();

          await User.deleteOne({ _id: userId });
        }
      } catch (err) {
        console.log(err)
      }
    })
    );
  });



  // Listening for a rounds event 
  socket.on('set:rounds', async (data) => {
    const { rounds, roomId } = data;
    socket.broadcast.to(roomId).emit('new:rounds', { rounds: rounds });

    try {
      const room = await Room.findOne({ _id: roomId });

      if (room) {
        room.rounds = rounds;
        await room.save();
      }
    } catch (error) {
      console.error('Error setting rounds:', error);
    }
  });

  socket.on('set:start', (data) => {
    const { roomId } = data;
    io.to(roomId).emit('new:start');
  })


  socket.on('set:time', async (data) => {

    const { time, roomId } = data;

    socket.broadcast.to(roomId).emit('new:time', { time: time });

    try {
      const room = await Room.findOne({ _id: roomId });

      if (room) {
        room.actTime = time;
        await room.save();
      }
    } catch (error) {
      console.error('Error setting time:', error);
    }
  });

  socket.on('set:customword', async (data) => {
    const { word, roomId } = data;
    socket.broadcast.to(roomId).emit('new:customword', { word: word });

    try {
      const room = await Room.findOne({ _id: roomId });

      if (room) {
        room.customWords.push(word);
        await room.save();

      }
    } catch (error) {
      console.error('Error setting custom word:', error);
    }
  });



  socket.on('set:kick', async ({
    kickedId,
    ownerId,
    roomId,
    kickedUsername
  }) => {
    try {
      const room = await Room.findOne({ _id: roomId, admin: ownerId });
      if (room) {
        console.log("kick from  Room ID: " + roomId + "user kciked =" + kickedId, "by owner -" + ownerId);
        io.to(roomId).to(kickedId).emit('new:kicked');
        io.to(roomId).emit('user-disconnected', { userId: kickedId, username: kickedUsername })

        // Remove the user from the players array
        const index = room.players.indexOf(kickedId);
        if (index !== -1) {
          room.players.splice(index, 1);
        }
        // Save the updated room
        await room.save();

        await User.deleteOne({ _id: kickedId });
        // Update the user's room field
      }
    } catch (error) {
      console.error('Error checking room ownership:', error);

    }
  })

  // Listening for a message event 
  socket.on('message', (data) => {
    const { message, roomId, username } = data;
    console.log(message)
    console.log(roomId)
    console.log(username)

    io.to(roomId).emit('new-message', { username: username, message: message, type: "" });
    console.log('message sent')
  })

  socket.on('correct-guess', (data) => {

  })

  socket.on('round-end', (data) => {
    const { roomId, players } = data
    console.log('round-end')
    io.to(roomId).emit('new-word', `${words[Math.floor(Math.random() * words.length)].toLowerCase()}`);
    const randomIndex = Math.floor(Math.random() * players.length)
    const currentDate = new Date();
    io.to(roomId).emit('new-round', { player: players[randomIndex], endTimer: currentDate.getSeconds() + 60 });
    console.log('new word sent')
  })
})

server.listen(process.env.PORT || 4000, () => console.log('server is running on port 4000'));