import React, { useCallback, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/User/userSlice";
import Login from "./login/page";
import Main from "./main/page";
import Lobby from "./lobby/page";
import Game from "./game/[id]/page";
import CreateRoom from "./CreateRoom/page"
import Room from "./room/page"

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
