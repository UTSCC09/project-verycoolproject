import React, { useCallback, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/User/userSlice";
import Login from "../pages/login/login";
import Main from "../pages/main/main";
import Lobby from "../pages/lobby/lobby";
import Game from "../pages/game/game";

function App() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);

    const updateUser = useCallback(() => {
        const { username, id, user_id, access_token } = localStorage;

        if (username && id && access_token) {
            dispatch(
                setUser({
                    id,
                    user_id,
                    username,
                    access_token,
                })
            );
        }
    }, [dispatch]);

    useEffect(updateUser, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/game" element={<Game />} />
                <Route path="/lobby" element={<Lobby />} />
            </Routes>

        </Router >
    );
}

export default App;
