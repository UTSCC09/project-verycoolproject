
import mongoose from "mongoose";
const { Schema, SchemaTypes, model } = mongoose;

const RoomSchema = new Schema({
    screen: {
        type: String,
        default: 'lobby',
    },
    rounds: {
        type: Number,
        default: 2,
    },
    curr_round: {
        type: Number,
        default: 1,
    },
    actTime: {
        type: Number,
        default: 80,
    },
    customWords: {
        type: Array,
        default: [],
    },
    messages: {
        type: Array,
        default: [],
    },
    word: {
        type: String,
        default: '',
    },
    endTime: {
        type: Number,
        default: 0,
    },
    players: [{ type: SchemaTypes.ObjectId, ref: 'User' }],
    admin: {
        type: String,
        default: '',
    },
    turn: { type: SchemaTypes.ObjectId, ref: 'User' },
    startEnd: {
        type: {
            start: {
                type: Number,
                default: 0,
            },
            end: {
                type: Number,
                default: 60,
            },
        },
        default: {
            start: 0,
            end: 60,
        },
    },
});


const Room = model('Room', RoomSchema);

export { Room };
