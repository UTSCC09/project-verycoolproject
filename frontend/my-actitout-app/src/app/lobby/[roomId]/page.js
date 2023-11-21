"use client";

import axios from "axios";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { Avatar, Inputs } from "../../../components";
import Load from "../../../../public/loading-white.gif"
import { useDispatch, useSelector } from "react-redux";

import { selectGameState, selectUserState } from '../../../selectors/useSelector';


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
    setAllPlayers,
    addPlayer,
    removePlayer,
    showLobby,
    showGame
} from "../../../store/GameRoom/gameRoomSlice";
import { set_id } from "../../../store/User/userSlice";

import { addPlayerToRoom, getRoomById, get_players } from "../../../api/api.mjs"

const Lobby = (params) => {

    const { roomId } = params.params;

    const dispatch = useDispatch();
    const user = useSelector(selectUserState);
    const game = useSelector((state) => state.game);

    const { push } = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Make API call to get game data
                const gameData = await getRoomById(roomId);
                const { screen } = gameData;

                const { players } = await get_players(roomId);

                // Dispatch action to update game state in Redux
                dispatch(setAllPlayers(players));
                // dispatch(setRound(4));

                // console.log(game);
                // Set loading to false when data is fetched
                setLoading(false);
            } catch (error) {
                console.error('Error fetching game data:', error);
            }
        };

        // Call fetchData when the component mounts
        fetchData();
    }, [dispatch, roomId]);


    // add code to add user image on socket info
    // useEffect(() => { //make sure the sockets only render once and are deleted on any rerenders
    //     socket.emit('join-room', id);

    //     socket.on("new_user", (data) => {
    //         console.log(data);
    //         smthhhhhh
    //     })

    //     return () => {
    //         socket.off("new_message");
    //     };
    // }, []);

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
                                    onClick={() => push(`/game/${roomId}`)}
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
                                    {/* {player.id === user.id && (
                                        <div className="text-yellow-300">You</div>
                                    )}
                                    {player.id === game.creator && (
                                        <div className="text-yellow-300">Admin</div>
                                    )} */}
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
