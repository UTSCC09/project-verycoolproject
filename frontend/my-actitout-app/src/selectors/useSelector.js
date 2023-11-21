// selectors.js
import { createSelector } from 'reselect';

// Parametrized selector function
const createSelectProperty = (property) => createSelector(
    (state) => state.user, // Assume state.user is an object
    (user) => user[property]
);

// Use the selector function directly
export const selectUserState = (state) => state.user;
export const selectGameState = (state) => state.game;
export const selectProperty = createSelectProperty; // You can also use a more specific name if needed
