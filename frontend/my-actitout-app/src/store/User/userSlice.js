"use client"
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    id: '',
    username: 'cool person',
    score: 0,
    rank: 0,
    correct: 0
};

// Create a function for other actions
const setLocalStorageValue = (stateKey) => (state, action) => {
    state[stateKey] = action.payload;
    localStorage.setItem(stateKey, state[stateKey]);
};


const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            const { id, username, score, rank, correct } = action.payload;
            state.id = id;
            state.username = username;
            state.score = score;
            state.rank = rank;
            state.correct = correct;

            // Store user data in localStorage
            localStorage.setItem('id', id);
            localStorage.setItem('username', username);
            localStorage.setItem('score', score);
            localStorage.setItem('rank', rank);
            localStorage.setItem('correct', correct);
        },
        set_userid: setLocalStorageValue('id'),
        set_username: setLocalStorageValue('username'),
        set_score: setLocalStorageValue('score'),
        set_rank: setLocalStorageValue('rank'),
        set_correct: setLocalStorageValue('correct'),
    },
});

export const { setUser, set_userid, set_username, set_score, set_rank, set_correct } = userSlice.actions;

// export const selectUserState = (RootState) => RootState.user
export default userSlice.reducer;
