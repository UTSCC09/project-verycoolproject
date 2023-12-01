"use client";

import axios from "axios";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { Avatar, Inputs } from "../../../components";
import Load from "../../../../public/loading-white.gif"
import { useDispatch, useSelector } from "react-redux";
import Game from "./game"


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

import { addPlayerToRoom, getRoomById, get_players, getUserId, getUsername, deletUser, deleteRoom } from "../../../api/api.mjs"
import { io } from 'socket.io-client';
import { Socket } from "socket.io";


const Lobby = (params) => {


    const { roomId } = params.params;

    const dispatch = useDispatch();
    const user = useSelector(selectUserState);
    const game = useSelector(selectGameState);

    const { push, back, replace } = useRouter();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        console.log(document.cookie);
    }, [])


    const [socket, setSocket] = useState();

    useEffect(() => {
        // const roomId = location;
        if (roomId) {
            const _socket = io(process.env.NEXT_PUBLIC_BACKEND, {
                transports: ["websocket"],
            });
            // getDetails();
            setSocket(_socket);
        }
    }, []);



    useEffect(() => {
        const fetchData = async () => {
            try {
                // Make API call to get game data
                const gameData = await getRoomById(roomId);
                const { screen, admin } = gameData;
                console.log(screen);
                console.log(game.screen);
                const { players } = await get_players(roomId);
                // Dispatch action to update game state in Redux
                dispatch(setAllPlayers(players));
                dispatch(setadmin(admin));
                if (screen === "lobby") { dispatch(showLobby()); }
                else { dispatch(showGame()); }

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
    }, [roomId]);


    const addplayer = (player) => {
        console.log("Player added");
        dispatch(addPlayer(player));
        dispatch(
            addMessage({
                type: "join",
                message: `${player.username} joined the game.`,
            })
        );
    };

    const deleteplayer = (userId, username) => {
        console.log("Player removed");
        dispatch(removePlayer(userId));
        dispatch(addMessage({
            type: "left",
            message: `${username} left the game.`
        }));
    };

    const setGameRounds = (val) => {
        dispatch(setRounds(val));
        if (emit)
            socket.emit(`set:rounds`, {
                roomid: roomId,
                rounds: val,
            });
    };
    
    const setGameActTime = (val) => {
        dispatch(setactTime(val));
        if (emit)
            socket.emit(`set:rounds`, {
                roomid: roomId,
                rounds: val,
            });
    };

    const setCustomWords = (val, emit = true) => {
        dispatch(set_customWords(val));
        if (emit)
            socket.emit(`game:set:customWords`, {
                id: gameId,
                customWords: val,
            });
    };

    // // add code to add user image on socket info
    useEffect(() => { //make sure the sockets only render once and are deleted on any rerenders
        if (!socket) return;

        socket.emit('join-room', roomId, user.id, user.username || localStorage.getItem("username"));

        socket.on("user-connected", (data) => {
            console.log(data);
            addplayer(data);
        })

        socket.on("user-disconnected", ({ userId, username }) => {

            deleteplayer(userId, username);
        })

        socket.on("new-message", (data) => {
            console.log(data);
            const { type, username, message } = data;
            dispatch(
                addMessage({
                    type: type,
                    username: username,
                    message: message,
                })
            );
        })

        return () => {
            socket.off("new_message");
        };
    }, [socket]);

    const isCreator = useMemo(() => {
        return game.admin === user.id;
    }, [game.admin, user.id]);


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
                                        setGameRounds(val);
                                    }}
                                    options={[2, 3, 4, 5, 6]}
                                />
                                <Inputs
                                    title="Act time in seconds"
                                    value={game.drawTime}
                                    disabled={!isCreator}
                                    onChange={(val) => {
                                        if (!isCreator) return;
                                        setGameActTime(val);
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
                                    onClick={() => startGame()}
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
                                    {player.id === game.admin && (
                                        <div className="text-yellow-300">Admin</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <h1 className="text-4xl text-black">Invite your friends! </h1>

                    <HoverableDiv link={`${process.env.FRONTEND}/?id=${roomId}`} />
                </div>
            </div >
        );
    } else {
        return <Game socket={socket} roomId={roomId} user={user} />;
    }
}

const HoverableDiv = ({ link }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div className="flex bg-white mt-4">
            <div
                className="flex-1 text-md py-1"
                onMouseOver={() => setHovered(true)}
                onMouseOut={() => setHovered(false)}
            >
                {hovered ? (
                    link
                ) : (
                    <div className="text-yellow-500">
                        Hover over me to see the invite link!
                    </div>
                )}
            </div>
            <button
                className="w-16 bg-yellow-500 hover:bg-yellow-600 text-white"
                onClick={() => {
                    navigator.clipboard.writeText(link);
                }}
            >
                Copy
            </button>
        </div>
    );
};


export default Lobby;
