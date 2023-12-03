import { User } from "../models/User.js";
import { Room } from "../models/Rooms.js";
// Create a room
const create_room = async (req, res) => {
    try {
        const { userId } = req.body;
        const newRoom = new Room({ players: [userId] });
        await newRoom.save();
        res.json({ roomId: newRoom._id });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: error });
    }
};

// get random room
const get_random_room = async (req, res) => {
    console.log("rsnd room");
    try {
        const existingRoom = await Room.findOne();

        if (existingRoom) {
            res.json(existingRoom);
        } else {
            res.status(404).json({ error: 'No Room not found' });
        }
    } catch (error) {
        console.error('Error checking room:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// check if  room exist 
const check_room_exist = async (req, res) => {
    const { roomId } = req.params;
    try {
        const room = await Room.findOne({ _id: roomId });
        res.json({ exists: !!room });
    } catch (error) {
        console.error('Error checking room existence:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

//Endpoint to retrieve all player usernames in a room
const get_players = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Find the room by ID
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Fetch all players in the room
        const players = await User.find({ _id: { $in: room.players } });

        // Extract player details (including ID and username)
        const playerDetails = players.map(player => ({
            id: player._id,  // Assuming _id is the ID property of your User model
            username: player.username,
            score: player.score,
            rank: player.rank,
            correct: player.correct
        }));

        res.json({ players: playerDetails })
    } catch (error) {
        console.error('Error retrieving players:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

};


// Retrieve room data by id
const get_room_by_id = async (req, res) => {
    const { id } = req.params;
    try {
        const room = await Room.findOne({ _id: id });
        if (room) {
            res.json(room);
        } else {
            res.status(404).json({ error: 'Room not found' });
        }
    } catch (error) {
        console.error('Error retrieving room data:', error);
        res.status(404).json({ error: 'Room not found' });
    }
};


// Delete a user by ID
const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;

        // Delete the room
        await Room.findByIdAndDelete(roomId);

        // Delete all players associated with the room
        await User.deleteMany({ room: roomId });

        res.json({ message: 'Room and associated players deleted successfully.' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a user from rom
const removePlayerFromRoom = async (req, res) => {
    try {
        const { roomId, userId } = req.params;

        // Find the room by ID
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Remove the user from the players array
        const index = room.players.indexOf(userId);
        if (index !== -1) {
            room.players.splice(index, 1);
        }

        // Save the updated room
        await room.save();


        await User.deleteOne({ _id: userId });
        // Update the user's room field

        res.json({ message: 'User removed from room successfully.' });
    } catch (error) {
        console.error('Error removing player from room:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const addPlayerToRoom = async (req, res) => {
    try {
        const { roomId, userId } = req.params;

        // Find the room by ID
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Add the user to the players array
        room.players.push(userId);

        // Save the updated room
        await room.save();

        // Update the user's room field
        await User.findByIdAndUpdate(userId, { room: roomId });

        res.json({ message: 'User added to room successfully.' });
    } catch (error) {
        console.error('Error adding player to room:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

//Endpoint to retrieve all player usernames in a room
const getRoundData = async (req, res) => {
    try {
        const { roomId } = req.body;

        // Find the room by ID
        const room = await Room.findById(roomId, 'num_correct players ');

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.json({ players: playerDetails })
    } catch (error) {
        console.error('Error retrieving players:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

};

export default { get_players, check_room_exist, addPlayerToRoom, removePlayerFromRoom, create_room, deleteRoom, get_random_room, get_room_by_id };


