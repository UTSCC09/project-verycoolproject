import { User } from "../models/User.js";

import { parse, serialize } from "cookie";

//chatgpt using following prompt: "if im suing validator.isAlphanumeric to sanitize, how can i have it still allow spaces?" response too long to comment here
const isAlphanumericWithSpaces = (input) => {
    return /^[a-zA-Z0-9 ]+$/.test(input);
  };

// Create a new user
const create_new_user = async (req, res) => {
    try {
        let { username } = req.body;
        if(!isAlphanumericWithSpaces(username)){username = "badperson"}
        const newUser = new User({ username });
        const savedUser = await newUser.save();

        // Initialize the user's session
        req.session.userId = savedUser._id;
        // Set a cookie for the session
        res.setHeader(
            "Set-Cookie",
            serialize('username', username, { path: '/', maxAge: 60 * 60 * 24 * 7, httpOnly: false }),
        );
        console.log(savedUser._id)
        res.status(200).json(savedUser._id);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all users
const get_all_user = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get a specific user by ID
const get_user_by_id = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error getting user by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update a user by ID
const update_user = async (req, res) => {
    try {
        const { username, score, room, rank, correct } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { username, score, room, rank, correct },
            { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete a user by ID
const delete_user = async (req, res) => {
    try {
        req.session.destroy();
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(deletedUser);
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// DON'T DELETE THIS ONE
// Get all users in a specific room by room ID
const get_users_by_room = async (req, res) => {
    try {
        const usersInRoom = await User.find({ room: req.params.roomId });
        res.json(usersInRoom);
    } catch (error) {
        console.error('Error getting users in room by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default {
    create_new_user, get_all_user, get_user_by_id, get_users_by_room, update_user, delete_user
};

