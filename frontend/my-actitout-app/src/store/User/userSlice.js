"use client"
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    id: '',
    user_id: '',
    username: 'lord',
    access_token: '',
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
            const { id, user_id, username, access_token, email } = action.payload;
            state.id = id;
            state.user_id = user_id;
            state.username = username;
            state.access_token = access_token;

            // Store user data in localStorage
            localStorage.setItem('id', id);
            localStorage.setItem('user_id', user_id);
            localStorage.setItem('username', username);
            localStorage.setItem('email', email);
            localStorage.setItem('access_token', access_token);
        },
        set_id: setLocalStorageValue('id'),
        set_userid: setLocalStorageValue('user_id'),
        set_username: setLocalStorageValue('username'),
        set_email: setLocalStorageValue('email'),
        set_accessToken: setLocalStorageValue('access_token'),
    },
});

export const { setUser, set_id, set_userid, set_username, set_accessToken } = userSlice.actions;

// export const selectUserState = (RootState) => RootState.user
export default userSlice.reducer;
