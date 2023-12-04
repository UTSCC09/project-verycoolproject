
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
        default: 0,
    },
    actTime: {
        type: Number,
        default: 80,
    },
    customWords: {
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
    correctPlayers: {
        type: Array,
        default: [],
    },
    nextPlayers: {
        type: Array,
        default: [],
    },
    currentPlayer: {
        type: String,
        default: '',
    }
});


const Room = model('Room', RoomSchema);

export { Room };
