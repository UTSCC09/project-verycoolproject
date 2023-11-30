
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
    room: { type: SchemaTypes.ObjectId, ref: 'Room' },
    rank: {
        type: Number,
        default: 0,
    },
    correct: {
        type: Number,
        default: 0,
    },
});

const User = model('User', userSchema);
export { User };
