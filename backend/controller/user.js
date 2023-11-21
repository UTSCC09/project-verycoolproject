const User = require('../models/User');

// Create a new user
const create_new_user = async (req, res) => {
    try {
        const { username } = req.body;
        const newUser = new User({ username });
        const savedUser = await newUser.save();
        res.json(savedUser._id);
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

// Get all users in a specific room by room ID
const get_users_by_romm = async (req, res) => {
    try {
        const usersInRoom = await User.find({ room: req.params.roomId });
        res.json(usersInRoom);
    } catch (error) {
        console.error('Error getting users in room by ID:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { create_new_user, get_user_by_id, get_all_user, get_users_by_romm, update_user, delete_user }
