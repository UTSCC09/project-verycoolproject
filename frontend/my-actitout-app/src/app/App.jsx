import React, { useCallback, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/User/userSlice";
import Login from "../pages/login";

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
            {user.user_id ? (
                <Routes>
                    <Route exact path="/" element={<Login />} />
                </Routes>
            ) : (
                <Routes>
                    <Route path="/" element={<Login />} />
                </Routes>
            )}
        </Router >
    );
}

export default App;
