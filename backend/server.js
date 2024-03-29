// Importing modules using ESM syntax
import express from "express";
import { config as dotenvConfig } from "dotenv";
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

      if (room.players.length <= 1) {
        io.to(roomId).emit("game-end")
        await room.deleteOne({ _id: roomId });
      } else {
        if (room.admin === socket.id) {
          const new_owner = await AssignNewAdmin(io, roomId);
          if (new_owner) {
            io.to(new_owner).emit("set:admin"); // set message to the new admin only
            io.to(roomId).emit('new:admin', { username: username, message: "Is the New Admin!", type: "join" });
            await Room.findByIdAndUpdate(roomId, { $set: { admin: new_owner } }
            );
          }
        }
      }
      // Delete the user
      await User.deleteOne({ _id: userId });
    }
  } catch (err) {
    console.error(err)
  }
};

async function addScore(userId, timeLeft) {
  try {
    const user = await User.findById(userId);
    if (user) {
      user.score += 100 + timeLeft;
      await user.save();
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return;
  }
}

const setRoomOwner = async (socket, roomId) => {

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
  } catch (error) {
    console.error('Error updating user:', error);
    return;
  }

};

//chatgpt using following prompt: "if im suing validator.isAlphanumeric to sanitize, how can i have it still allow spaces?" response too long to comment here
const isAlphanumericWithSpaces = (input) => {
  return /^[a-zA-Z0-9 ]+$/.test(input);
};



io.on(`connection`, socket => {

  socket.on('join-room', (roomId, userId, username) => {
    // if the first person is entering a room then sets the as the admin of room 
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) {
      io.to(socket.id).emit("set:admin");
      setRoomOwner(socket, roomId)
    }

    // set socket id of the user in user db
    setUserSocketId(socket.id, userId)


    socket.join(roomId)

    socket.to(roomId).emit('user-connected', {
      id: userId,
      username: username,
      score: 0,
      rank: 0,
      correct: 0,
    });
    io.to(roomId).emit('new-message', { username: "", message: `${username} joined the game`, type: "join" });


    socket.on('join-game', async (roomId, userId) => {
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

  socket.on('get-current-player', async (roomId) => {
    const room = await Room.findById(roomId);
    if (room){
      io.to(socket.id).emit("current-player", `${room.currentPlayer}`);
    }
  })

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
          removePlayer(socket, roomId, kickedId, kickedUsername);
          const user = await User.findById(kickedId)
          if (user) {
            io.to(user.socketId).emit('new:kicked');
          }

        }
      }
    } catch (error) {
      console.error('Error checking room ownership:', error);

    }
  })

  socket.on('exiting-game', async (userId) => {
    await User.deleteOne({_id: userId})
  })

  // Listening for a message event 
  socket.on('message', (data) => {
    const { message, type, username, roomId } = data;
    if (isAlphanumericWithSpaces(message)) {
      io.to(roomId).emit('new-message', { username: username, message: message, type: type });
    }
  })

  socket.on('correct-guess', async (data) => {
    const { roomId, userId, username, timeLeft } = data;
    try {
      const check = await Room.findById(roomId);
      if (check) {
        if (check.correctPlayers.includes(userId))
          return;
      }

      const room = await Room.findByIdAndUpdate(
        roomId,
        { $addToSet: { correctPlayers: userId } },
        { new: true }
      );

      if (room) {
        io.to(roomId).emit('new-message', { username: "", message: `${username} guessed the answer`, type: "correct" });
        await addScore(userId, timeLeft);
        if (room.correctPlayers.length >= room.players.length - 1) { // Check if current turn is done
          room.correctPlayers = [];

          if (room.nextPlayers.length == 0) {
            // Next round
            room.curr_round += 1;

            if (room.curr_round > room.rounds) {
              // Game end logic
              await Room.findOneAndUpdate(
                { _id: roomId },
                {
                  $set: {
                    screen: "lobby",
                    word: "",
                    curr_round: 0,
                  }
                },
                { new: true }
              )

              io.to(roomId).emit('game-end');
              return;
            }

            room.nextPlayers = room.players;
          }

          // Next turn logic
          const newWord = words[Math.floor(Math.random() * words.length)].toLowerCase();
          io.to(roomId).emit('new-word', `${newWord}`);
          const currentDate = new Date();
          const endTime = currentDate.getTime() + (room.actTime + 2) * 1000;
          const currentPlayer = room.nextPlayers.pop();
          io.to(roomId).emit('new-round', { player: currentPlayer._id, endTimer: endTime, round: room.curr_round });
          await Room.findOneAndUpdate(
            { _id: roomId },
            {
              $set: {
                players: room.players,
                correctPlayers: room.correctPlayers,
                nextPlayers: room.nextPlayers,
                currentPlayer: currentPlayer,
                word: newWord,
                endTime: endTime,
                curr_round: room.curr_round,
              }
            },
            { new: true }
          )

        }
      } else {
        console.error('Room not found');
      }
    } catch (error) {
      console.error('Error updating room:', error);
    }
  });

  socket.on('round-end', async (data) => {
    const { roomId } = data
    const room = await Room.findById(roomId)
    if (room) {
      if (room.admin != socket.id) {
        return;
      }

      room.correctPlayers = [];

      if (room.nextPlayers.length == 0) {
        // Next round
        room.curr_round += 1;

        if (room.curr_round > room.rounds) {
          // Game end logic
          await Room.findOneAndUpdate(
            { _id: roomId },
            {
              $set: {
                screen: "lobby",
                word: "",
                curr_round: 0,
              }
            },
            { new: true }
          )

          io.to(roomId).emit('game-end');
          return;
        }

        room.nextPlayers = room.players;
      }

      // Next turn logic
      const newWord = words[Math.floor(Math.random() * words.length)].toLowerCase();
      io.to(roomId).emit('new-word', `${newWord}`);
      const currentDate = new Date();
      const endTime = currentDate.getTime() + (room.actTime + 2) * 1000;
      const currentPlayer = room.nextPlayers.pop();
      io.to(roomId).emit('new-round', { player: currentPlayer._id, endTimer: endTime, round: room.curr_round });
      await Room.findOneAndUpdate(
        { _id: roomId },
        {
          $set: {
            players: room.players,
            correctPlayers: room.correctPlayers,
            nextPlayers: room.nextPlayers,
            currentPlayer: currentPlayer,
            word: newWord,
            endTime: endTime,
            curr_round: room.curr_round,
          }
        },
        { new: true }
      )
    }
  })
})

server.listen(process.env.PORT || 4000, () => console.log('server is running on port 4000'));