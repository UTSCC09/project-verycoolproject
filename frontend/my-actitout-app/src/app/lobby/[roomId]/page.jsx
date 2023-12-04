"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from 'next/navigation';
import { Avatar, Inputs } from "../../../components";
import { useDispatch, useSelector } from "react-redux";
import Game from "./game"




import { selectGameState, selectUserState } from '../../../selectors/useSelector';
import "./lobby.css"

import {
    clearGameState,
    setCorrects,
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
    setEndTime,
    removePlayer,
    showLobby,
    showGame
} from "../../../store/GameRoom/gameRoomSlice";
import { set_id } from "../../../store/User/userSlice";

import { addPlayerToRoom, getRoomById, get_players, getUserId, getUsername, deletUser, deleteRoom } from "../../../api/api.mjs"
import { io } from 'socket.io-client';

// import { Socket } from "socket.io";


const Lobby = (params) => {


    const { roomId } = params.params;

    const dispatch = useDispatch();
    const user = useSelector(selectUserState);
    const game = useSelector(selectGameState);
    const [popup, setPopup] = useState("");
   
    const [loading, setLoading] = useState(true);
    const [isCreator, setCreator] = useState(false);
    const { push, back, replace } = useRouter();


    const [socket, setSocket] = useState();

    // useEffect(() => {
    //     const initializeSocket = async () => {
    //         if (roomId) {
    //             const _socket = await io(process.env.NEXT_PUBLIC_BACKEND);
    //             setSocket(_socket);
    //             // setLoading(false);
    //         }
    //     };
    //     initializeSocket();
    // }, [roomId]);



    useEffect(() => {
        const fetchData = async () => {
            try {


                // Make API call to get game data
                const gameData = await getRoomById(roomId);
                const { players } = await get_players(roomId);
                // Dispatch action to update game state in Redux
                dispatch(setAllPlayers(players));
                dispatch(setadmin(gameData.admin));
                dispatch(setRounds(gameData.rounds));
                dispatch(setactTime(gameData.actTime));
                dispatch(setCustomWords(gameData.customWords));
                dispatch(setRound(gameData.curr_round));
                dispatch(setEndTime(gameData.endTime));
                dispatch(setWord(gameData.word));

                if (gameData.screen === "lobby") { dispatch(showLobby()); }
                else { dispatch(showGame()); }

            } catch (error) {
                console.error('Error fetching game data:', error);
            }
        };

        const initializeSocket = async () => {
            if (roomId) {
                const _socket = await io(process.env.NEXT_PUBLIC_BACKEND);
                setSocket(_socket);
            }
        };
        const initializeData = async () => {
            try {
                await Promise.all([initializeSocket(), fetchData()]);
            } finally {
                setLoading(false);
            }
        };

        initializeData();

    }, [roomId]);


    const addplayer = (player) => {
        dispatch(addPlayer(player));
    };

    const deleteplayer = (userId, username) => {
        dispatch(removePlayer(userId));
    };

    const setGameRounds = (val, emit = true) => {
        dispatch(setRounds(val));
        if (emit) {
            socket.emit(`set:rounds`, {
                roomId: roomId,
                rounds: val,
            });
        }
    };

    const setGameActTime = (time, emit = true) => {
        dispatch(setactTime(time));
        dispatch(setStartEnd({ start: 0, end: time }))
        if (emit) {
            socket.emit('set:time', {
                roomId: roomId,
                time: time,
            });
        }
    };

    const startGame = () => {
        if (game.players.length < 0) return;
        socket.emit(`set:start`, {
            roomId: roomId,
        });
    };

    const kickPlayer = (userId, username) => {
        if (game.players.length < 2) return;
        socket.emit(`set:kick`, {
            kickedId: userId,
            roomId: roomId,
            kickedUsername: username
        });
    };

    const addWords = (word, emit = true) => {
        dispatch(setCustomWords(word));
        if (emit) {
            socket.emit(`set:customword`, {
                roomid: roomId,
                word: word,
            });
        }
    };


    // // add code to add user image on socket info
    useEffect(() => { //make sure the sockets only render once and are deleted on any rerenders
        if (!socket) return;

        socket.emit('join-room', roomId, user.id, user.username || localStorage.getItem("username"));

        socket.on("user-connected", (data) => {
            addplayer(data);
        });

        socket.on("user-disconnected", ({ userId, username }) => {
            deleteplayer(userId, username);
        });

        socket.on("new:rounds", ({ rounds }) => {
            setGameRounds(rounds, false);
        });

        socket.on("new:time", ({ time }) => {
            setGameActTime(time, false);
        });
        socket.on("new:customword", ({ word }) => {
            addWords(word, false);
        });
        socket.on("new:start", () => {
            dispatch(showGame());
        });

        socket.on("new:kicked", () => {
            setPopup("You have been kicked")
            setTimeout(() => {
                setPopup("");
                push("/");
            }, 5000);
        });

        socket.on("set:admin", () => {
            setCreator(true);
        });
        return () => {
            socket.off("new_message");
        };
    }, [socket]);





    if (game.screen === "lobby") {
        return (
            <div>
                {loading ? (
                    <div className="flex items-center justify-center h-screen">
                        <div className="loader"></div>
                    </div>
                ) : popup !== "" ? (
                    <div>
                        <div className="blur"></div>
                        <div className="flex items-center justify-center h-screen">
                            <div className="popup-container">
                                <h2>{popup}</h2>
                                {popup && (
                                    <button
                                        onClick={() => setPopup("")}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold my-5 py-2 px-4 rounded"
                                    >
                                        Ok
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
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
                                            value={game.actTime}
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
                                                addWords(e.target.value);
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
                                            className={"flex flex-col text-white text-sm text-center"}
                                            key={player.id}
                                        >
                                            <div
                                                onClick={() => isCreator && player.id !== user.id && kickPlayer(player.id, player.username)}
                                                className={"cursor-pointer " + (isCreator && player.id != user.id ? "kickable-avatar" : "")}
                                            >
                                                <Avatar seed={player.username} alt={player.id} />
                                            </div>
                                            <div className="mt-2 sm:text-sm md:text-xl">
                                                {player.username}
                                            </div>
                                            {player.id === user.id && (
                                                <div className="text-yellow-300">You</div>
                                            )}
                                            {isCreator && player.id === user.id && (
                                                <div className="text-yellow-300">Admin</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 text-center">
                            <h1 className="text-4xl text-black">Invite your friends! </h1>

                            <HoverableDiv link={`${process.env.NEXT_PUBLIC_FRONTEND}/?id=${roomId}`} />
                        </div>
                    </div >
                )
                }
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
