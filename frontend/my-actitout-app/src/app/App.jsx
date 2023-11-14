import React, { useCallback, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/User/userSlice";
import Login from "../pages/login/login";
import Main from "../pages/main/main";
import Lobby from "../pages/lobby/lobby";
import Game from "../pages/game/game";
import CreateRoom from "../pages/CreateRoom/CreateRoom"
import Room from "../pages/Room/Room"

function App() {

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Main />} />
                <Route path="/game" element={<Game />} />
                <Route path="/lobby" element={<Lobby />} />
                <Route exact path="/room" element={<CreateRoom />} />
                <Route path="/room/:roomId" element={<Room />} />
            </Routes>
        </Router >
        
    );
}

export default App;
