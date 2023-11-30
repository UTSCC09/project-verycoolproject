import { createSlice } from '@reduxjs/toolkit';

// const Player = {
//     id: '1',
//     username: 'lordtest',
//     score: undefined,
//     rank: undefined,
//     correct: undefined
// };

const initialState = {
    screen: "lobby",
    rounds: 2,
    curr_round: 1,
    actTime: 80,
    customWords: [],
    players: [],
    messages: [],
    admin: '',
    turn: '',
    word: '',
    timerLeft: 0,
    startEnd: {
        start: 0,
        end: 60
    }
};

const setField = (stateKey) => (state, action) => {
    state[stateKey] = action.payload;
};

export const gameRoomSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        clearGameState: (state) => {
            for (const key in initialState) {
                setField(key)(state, { payload: initialState[key] });
            }
        },
        setInitial: (state, action) => {
            for (const key in action.payload) {
                setField(key)(state, action);
            }
        },
        setRounds: setField('rounds'),
        setStartEnd: setField('startEnd'),
        setRound: setField('curr_round'),
        setactTime: setField('actTime'),
        setCustomWords: setField('customWords'),
        setadmin: setField('admin'),
        setTurn: setField('turn'),
        setWord: setField('word'),
        setAllPlayers: setField('players'),
        addPlayer: (state, action) => {
            state.players.push(action.payload);
        },
        removePlayer: (state, action) => {
            state.players = state.players.filter((p) => p.id !== action.payload);
        },
        showLobby: (state) => {
            state.screen = "lobby";
        },
        showGame: (state) => {
            state.screen = "game";
        },
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        }
    }
});

export const {
    clearGameState,
    setStartEnd,
    setRound,
    setWord,
    setInitial,
    setTurn,
    addMessage,
    setadmin,
    setRounds,
    setactTime,
    setCustomWords,
    addPlayer,
    removePlayer,
    setAllPlayers,
    showLobby,
    showGame
} = gameRoomSlice.actions;

// export const selectGameState = (RootState) => RootState.game;

export default gameRoomSlice.reducer;
