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
    origin: process.env.NEXT_PUBLIC_FRONTEND,
    methods: "*",
  },
});

const users = {};



app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_FRONTEND);
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



function getRandomRoomOwner(inputSet) {
  const elementsArray = Array.from(inputSet);
  return elementsArray.length > 0 ? elementsArray[Math.floor(Math.random() * elementsArray.length)] : null;
}

const AssignNewAdmin = async (io, roomId) => {
  const roomSockets = io.sockets.adapter.rooms.get(roomId);
  if (roomSockets) {
    const new_owner = getRandomRoomOwner(roomSockets);
    return new_owner;
  }
  return null;
};


const removePlayer = async (socket, roomId, userId, username) => {
  console.log("disconnected")
  io.to(roomId).emit('user-disconnected', { userId: userId, username: username });
  io.to(roomId).emit('new-message', { username: "", message: `${username} left the game`, type: "left" });
  try {
    const room = await Room.findByIdAndUpdate(
      roomId,
      {
        $pull: { players: userId, nextPlayers: userId }
      },
      { new: true }
    );

    if (room) {

      if (room.players.length === 0) {
        await room.deleteOne({ _id: roomId });
      }
      else {
        if (room.admin === socket.id) {
          const new_owner = await AssignNewAdmin(io, roomId);
          if (new_owner) {
            console.log("new admin assigned " + new_owner);
            io.to(new_owner).emit("set:admin"); // set message to the new admin only
            room.admin = new_owner;
            io.to(roomId).emit('new:admin', { username: username, message: "Is the New Admin!", type: "join" });
          }

          await room.save();
        }
      }

      await User.deleteOne({ _id: userId });
    }
  } catch (err) {
    console.log(err)
  }
};

const setRoomOwner = async (socket, roomId) => {
  console.log("first person =" + socket.id);

  try {
    // Find the room by ID
    await Room.findByIdAndUpdate(
      roomId,
      { admin: socket.id },
    );

  } catch (error) {
    console.error('Error updating user:', error);
    return;
  }

};


const setUserSocketId = async (socketId, userId) => {
  try {
    await User.findByIdAndUpdate(userId, { socketId: socketId });
    console.log("set the user socket id");
  } catch (error) {
    console.error('Error updating user:', error);
    return;
  }

};



io.on(`connection`, socket => {

  socket.on('join-room', (roomId, userId, username) => {
    // if the first person is entering a room then sets the as the admin of room 
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) {
      console.log("i am the orignal admin")
      io.to(socket.id).emit("set:admin");
      setRoomOwner(socket, roomId)
    }

    // set socket id of the user in user db
    setUserSocketId(socket.id, userId)


    socket.join(roomId)

    console.log("Room ID: " + roomId + " | User ID: " + userId + " | username " + username + " | socketId " + socket.id)

    socket.to(roomId).emit('user-connected', {
      id: userId,
      username: username,
      score: 0,
      rank: 0,
      correct: 0,
    });
    io.to(roomId).emit('new-message', { username: "", message: `${username} joined the game`, type: "join" });


    socket.on('join-game', (roomId, userId) => {

      console.log(userId + " joined video room")
      socket.to(roomId).emit('user-connected-game', userId)

      socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected-game', userId)
      })
    })

    socket.on('disconnect', (async () => {
      await removePlayer(socket, roomId, userId, username);
    })
    );
  });

  // Listening for a rounds event 
  socket.on('set:rounds', async (data) => {
    const { rounds, roomId } = data;
    try {
      const room = await Room.findOne({ _id: roomId });
      if (room) {
        if (room.admin === socket.id) {
          socket.broadcast.to(roomId).emit('new:rounds', { rounds: rounds });
          room.rounds = rounds;
          await room.save();
        }
      }
    } catch (error) {
      console.error('Error setting rounds:', error);
    }
  });

  socket.on('set:start', async (data) => {
    const { roomId } = data;
    try {
      const room = await Room.findOne({ _id: roomId });
      if (room) {
        if (room.admin === socket.id) {
          io.to(roomId).emit('new:start');
          room.screen = "game";
          await room.save();
        }
      }
    } catch (error) {
      console.error('Error starting the game:', error);
    }

  })


  socket.on('set:time', async (data) => {
    const { time, roomId } = data;
    try {
      const room = await Room.findOne({ _id: roomId });
      if (room) {
        if (room.admin === socket.id) {
          socket.broadcast.to(roomId).emit('new:time', { time: time });
          room.actTime = time;
          await room.save();
        }

      }
    } catch (error) {
      console.error('Error setting time:', error);
    }
  });

  socket.on('set:customword', async (data) => {
    const { word, roomId } = data;

    try {
      const room = await Room.findOne({ _id: roomId });
      if (room) {

        if (room.admin === socket.id) {
          socket.broadcast.to(roomId).emit('new:customword', { word: word });
          room.customWords.push(word);
          await room.save();
        }



      }
    } catch (error) {
      console.error('Error setting custom word:', error);
    }
  });


  socket.on('set:kick', async ({
    kickedId,
    roomId,
    kickedUsername
  }) => {
    try {
      const room = await Room.findOne({ _id: roomId });
      if (room) {
        if (room.admin === socket.id) {
          console.log("kick from  Room ID: " + roomId + "user kciked =" + kickedId);
          removePlayer(socket, roomId, kickedId, kickedUsername);
          const user = await User.findById(kickedId)
          console.log(user)
          if (user) {
            io.to(user.socketId).emit('new:kicked');
          }

        }
      }
    } catch (error) {
      console.error('Error checking room ownership:', error);

    }
  })

  // Listening for a message event 
  socket.on('message', (data) => {
    const { message, type, username, roomId } = data;
    console.log("Message: " + message + " | Room ID: " + roomId + " | Username: " + username)

    io.to(roomId).emit('new-message', { username: username, message: message, type: type });
    //console.log('message sent')
  })

  socket.on('correct-guess', async (data) => {
    const { roomId, userId } = data;
    console.log("Correct guess in room " + roomId);
    
    try {
      const room = await Room.findByIdAndUpdate(
        roomId,
        { $addToSet: { correctPlayers: userId } },
        { new: true }
      );

      if (room) {
        if (room.correctPlayers.length >= room.players.length - 1) { // Check if current turn is done
          console.log("Everyone has guessed")
          room.correctPlayers = [];
          
          if (room.nextPlayers.length == 0){
            // Next round
            room.curr_round += 1;

            if (room.curr_round > room.rounds) { 
              // Game end logic
              room.screen = "lobby"
              room.word = ""
              room.curr_round = 0
              await room.save();
              io.to(roomId).emit('game-end');
              return;
            }

            room.nextPlayers = room.players;
          } 

          // Next turn logic
          console.log('Starting new round...')
          io.to(roomId).emit('new-word', `${words[Math.floor(Math.random() * words.length)].toLowerCase()}`);
          const currentDate = new Date();
          const endTime = currentDate.getTime() + (room.actTime + 2) * 1000;
          const currentPlayer = room.nextPlayers.pop();
          io.to(roomId).emit('new-round', { player: currentPlayer._id, endTimer: endTime, round: room.curr_round });
          console.log('new word sent, current player: ' + currentPlayer._id)
          room.endTime = endTime;
          await room.save();

        }
      } else {
        console.log('Room not found');
      }
    } catch (error) {
      console.error('Error updating room:', error);
    }
  });

  socket.on('round-end', async (data) => {
    const { roomId } = data
    const room = await Room.findById(roomId)
    if (room) {
      if (room.admin != socket.id){
        return;
      }
      console.log("Round timer ended")
      room.correctPlayers = [];

      if (room.nextPlayers.length == 0) {
        // Next round
        room.curr_round += 1;

        if (room.curr_round > room.rounds) {
          // Game end logic
          room.screen = "lobby"
          room.word = ""
          room.curr_round = 0
          await room.save();
          io.to(roomId).emit('game-end');
          return;
        }

        room.nextPlayers = room.players;
      }

      // Next turn logic
      io.to(roomId).emit('new-word', `${words[Math.floor(Math.random() * words.length)].toLowerCase()}`);
      const currentDate = new Date();
      const endTime = currentDate.getTime() + (room.actTime + 2) * 1000;
      const currentPlayer = room.nextPlayers.pop();
      io.to(roomId).emit('new-round', { player: currentPlayer._id, endTimer: endTime, round: room.curr_round });
      console.log('new word sent, current player: ' + currentPlayer._id)
      room.endTime = endTime;
      await room.save();
    }
  })
})

server.listen(process.env.PORT || 4000, () => console.log('server is running on port 4000'));