import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./User/userSlice";
import gameReducer from "./GameRoom/gameRoomSlice";

const rootReducer = combineReducers({
    user: userReducer,
    game: gameReducer,
});

export const store = configureStore({
    reducer: rootReducer,
});

// export const RootState = store.getState;
// export const AppDispatch = store.dispatch;
