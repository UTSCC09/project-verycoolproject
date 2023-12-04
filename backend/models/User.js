
import mongoose from "mongoose";
const { Schema, SchemaTypes, model } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    score:
    {
        type: Number,
        default: 0,
    },
    socketId:
    {
        type: String,
        default: "",
    },
    room: { type: SchemaTypes.ObjectId, ref: 'Room' },
    correct: {
        type: Number,
        default: 0,
    },
});

const User = model('User', userSchema);
export { User };
