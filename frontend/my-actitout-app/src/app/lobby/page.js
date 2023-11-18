"use client";

import axios from "axios";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { Avatar, Inputs } from "../../components";
import Load from "../../../public/loading-white.gif"
import { useDispatch, useSelector } from "react-redux";

import { selectGameState, selectUserState } from '../../selectors/useSelector';


import {
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
    showLobby,
    showGame
} from "../../store/GameRoom/gameRoomSlice";
import { set_id } from "../../store/User/userSlice";

const Lobby = () => {

    const dispatch = useDispatch();
    const user = useSelector(selectUserState);
    const game = useSelector(selectGameState);

    const { push } = useRouter();
    const [loading, setLoading] = useState(true);


    const isCreator = useMemo(() => {
        // return game.creator === user.id;
        return true;
    }, [game.creator, user.id]);


    if (game.screen === "lobby") {
        return (
            <div className="h-full">
                <div className="h-32"></div>;
                <div className="bg-blue-300 flex justify-between">
                    <div className="w-1/2 md:w-5/12">
                        <h2 className="text-white text-3xl text-center mb-2">
                            Settings
                        </h2>
                        <div className="bg-white">
                            <h3 className="border-b text-2xl text-center py-1">Lobby</h3>
                            <div className="p-3">
                                <Inputs
                                    title="Rounds"
                                    value={game.rounds}
                                    disabled={!isCreator}
                                    onChange={(val) => {
                                        if (!isCreator) return;
                                        setRounds(val);
                                    }}
                                    options={[2, 3, 4, 5, 6]}
                                />
                                <Inputs
                                    title="Act time in seconds"
                                    value={game.drawTime}
                                    disabled={!isCreator}
                                    onChange={(val) => {
                                        if (!isCreator) return;
                                        setactTime(val);
                                    }}
                                    options={Array.from(
                                        { length: 16 },
                                        (v, i) => i * 10 + 30
                                    )}
                                />
                                <label className="block font-bold text-sm mb-1">Custom Words</label>
                                <textarea
                                    value={game.customWords}
                                    disabled={!isCreator}
                                    className="w-full rounded px-3 py-1 border border-gray-400 mb-3"
                                    placeholder="Type your custom words here separated by comma."
                                    onChange={(e) => {
                                        if (!isCreator) return;
                                        setCustomWords(e.target.value);
                                    }}
                                />
                                <button
                                    disabled={!isCreator}
                                    className="block bg-green-500 hover:bg-green-600 disabled:opacity-50 w-full text-white rounded h-10"
                                    onClick={() => push(`/game`)}
                                >
                                    Start Game
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="w-1/2 md:w-5/12">
                        <h2 className="text-white text-3xl text-center mb-2">
                            Players
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-5">
                            {game.players.map((player) => (
                                <div
                                    className="flex flex-col text-white text-sm text-center cursor-pointer"
                                    key={player.id}
                                >
                                    <div
                                        onClick={() => {
                                            console.log("kick");
                                        }}
                                    >
                                        <Avatar seed={player.username} alt={player.id} />
                                    </div>
                                    <div className="mt-2 sm:text-sm md:text-xl">
                                        {player.username}
                                    </div>
                                    {player.id === user.id && (
                                        <div className="text-yellow-300">You</div>
                                    )}
                                    {player.id === game.creator && (
                                        <div className="text-yellow-300">Admin</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <h1 className="text-4xl text-white">Invite your friends!</h1>
                </div>
            </div >
        );
    } else {
        return <></>;
    }


}

export default Lobby;
