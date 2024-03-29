"use client"
import React, { useEffect, useState, useRef } from "react";

import { Avatar, Logo } from "../../../components";

import { VideoStream } from "../../../components/VideoStream/VideoStream"
import { setWord, showLobby, setRound, updateScore, sortPlayers } from "../../../store/GameRoom/gameRoomSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectGameState, selectUserState } from '../../../selectors/useSelector';
import { getPlayersByRoom } from "@/api/api.mjs";
import { Peer } from "peerjs"

import UserRankings from "./rankings"


export default function Game(props) {

    // Learned about PeerJS and group video chats through https://www.youtube.com/watch?v=DvlyzDZDEq4&t=523s
    const [gameOver, setGameOver] = useState(false);

    const { roomId, socket, user } = props;

    const game = useSelector(selectGameState);

    const [peers, setPeers] = useState([]);
    const [streams, setStreams] = useState([]);
    const myVideo = useRef();
    const videoGrid = useRef(null);


    const myPeer = useRef();
    const [countdown, updateCountdown] = useState(0);
    let activeTimer;

    const [message, setMessage] = useState("");
    const dispatch = useDispatch();

    const currentPlayerId = useRef(null); // This will control who's video is being played


    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)'); // Adjust the media query as needed

        const handleMediaChange = (event) => {
            setIsMobile(event.matches);
        };

        // Initial check
        handleMediaChange(mediaQuery);

        // Listen for changes in the media query
        mediaQuery.addListener(handleMediaChange);

        // Clean up the listener when the component unmounts
        return () => {
            mediaQuery.removeListener(handleMediaChange);
        };
    }, []);

    const startCountdown = (endTimer) => {
        if (activeTimer) {
            clearInterval(activeTimer);
        }

        const timer = setInterval(() => {
            const curr = new Date().getTime();
            const seconds = Math.floor((endTimer - curr) / 1000);
            if (seconds < 0) {
                socket.emit("round-end", { roomId: roomId })
                clear();
            } else {
                updateCountdown(seconds);
            }
        }, 1000);

        activeTimer = timer;

        const clear = () => {
            clearInterval(activeTimer);
            activeTimer = null;
        };

        return () => {
            clear();
        };
    };

    const stopCamera = () => {
        if (myVideo.current && myVideo.current.srcObject) {
            const stream = myVideo.current.srcObject;
            const tracks = stream.getTracks();

            tracks.forEach((track) => {
                if (track.kind === 'video') {
                    track.stop(); // Stop the video track
                }
            });

            myVideo.current.srcObject = null; // Clear the video source object
        }
    };

    function sendMessage() {
        if (message.toLowerCase() == game.word) {
            if (user.id != currentPlayerId.current) {
                socket.emit('correct-guess', { roomId: roomId, userId: user.id, username: user.username, timeLeft: countdown })
            }

        }
        else {
            socket.emit('message', { message: message, type: "normal", username: user.username, roomId: roomId });
        }
        setMessage("");
    };

    function updateScoreboard() {
        getPlayersByRoom(roomId).then((data) => {
            data.forEach((dbPlayer) => {
                dispatch(updateScore({ id: dbPlayer._id, score: dbPlayer.score }))
            });
            dispatch(sortPlayers());
        })
    }

    function addVideoStream(video, stream) {
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () => {
            video.play();
        });
    }

    function connectToNewUser(userId, stream) {
        const call = myPeer.current.call(userId, stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
            streams[userId] = userVideoStream;
            switchVideo(currentPlayerId.current);
        });
        call.on('close', () => {
            video.remove();
        });
        peers[userId] = call;
    }

    function switchVideo(userId) {
        if (userId == null) {
            socket.emit('get-current-player', roomId)
        }
        if (videoGrid.current) {
            const video = document.createElement('video');
            addVideoStream(video, streams[userId]);
            videoGrid.current.innerHTML = "";
            videoGrid.current.appendChild(video);
        }
    }

    const setupPeers = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        myVideo.current = document.createElement('video');

        myPeer.current = new Peer(user.id);

        myPeer.current.on('open', id => {
            socket.emit("join-game", roomId, id);
            addVideoStream(myVideo.current, stream);
            streams[myPeer.current.id] = stream;
            switchVideo(currentPlayerId.current);
            myPeer.current.on('call', call => {
                call.answer(stream);
                const video = document.createElement('video');
                call.on('stream', userVideoStream => {
                    addVideoStream(video, userVideoStream);
                    streams[call.peer] = userVideoStream
                    switchVideo(currentPlayerId.current);
                });
            });

            socket.on('user-connected-game', userId => {
                connectToNewUser(userId, stream);
            });

            socket.on('user-disconnected-game', userId => {
                if (peers[userId]) {
                    peers[userId].close();
                    const updatedPeers = peers.filter((id) => id !== userId)
                    setPeers(updatedPeers)
                }
                if (streams[userId]) {
                    const updatedStreams = streams.filter((id) => id !== userId)
                    setStreams(updatedStreams)
                }
                if (currentPlayerId.current == userId) {
                    setTimeout(() => {
                        socket.emit('round-end', { roomId: roomId })
                    }, 1500)
                }
            });
        })

    }

    const cleanupPeers = () => {
        if (myPeer.current) {
            myPeer.current.destroy();
            myPeer.current = null;
        }

        setPeers([]);
        setStreams([]);
    };


    useEffect(() => { //make sure the sockets only render once and are deleted on any rerenders
        //socket.emit('join-room', roomId, user.id);

        socket.on("current-player", (data) => {
            if (currentPlayerId.current == null) {
                currentPlayerId.current = data;
                switchVideo(currentPlayerId.current);
            }
        })

        setupPeers();

        socket.on("new-word", (data) => {
            dispatch(setWord(data));
        })

        socket.on("game-end", (data) => {
            clearInterval(activeTimer);
            cleanupPeers();
            setGameOver(true);
            socket.emit("exiting-game", user.id)
            socket.destroy();
            stopCamera();
        })

        socket.on("new-round", (data) => { // When a new round is emitted from server, it will send the new round endTimer
            const { player, endTimer, round } = data
            dispatch(setRound(round))
            currentPlayerId.current = player;
            switchVideo(currentPlayerId.current);
            updateScoreboard();
            startCountdown(endTimer);
        })

        socket.on("new-message", (data) => {
            let div = document.createElement("div");
            div.className = getMessageColor(data.type);
            div.innerHTML = `${data.type === "normal" ? `${data.username}: ${data.message}` : `${data.message}`}`;
            document.getElementById("messages").appendChild(div);
        })

        startCountdown(game.endTime);

        return () => {
            socket.off("new-message");
            socket.off("new-word");
            socket.off("current-player")
            socket.off("new-round")
        };
    }, []);

    const getMessageColor = (type) => {
        switch (type) {
            case "join":
                return "text-green-400";
            case "correct":
                return "text-green-600";
            case "left":
                return "text-red-400";
            default:
                return "";
        }
    };

    return (
        <div>
            {gameOver ? (
                <UserRankings players={game.players} />
            ) : (
                <div className="flex flex-col">
                    <div className="h-32"><Logo /></div>;
                    <div className="rounded flex items-center bg-blue-50 mb-3 px-5 py-2 font-bold text-gray-600">
                        <div>
                            {countdown} <span className="ml-3">Round {game.curr_round} of {game.rounds}</span>
                        </div>
                        {user.id === currentPlayerId.current && (<div className="text-center flex-1 tracking-[3px]">{game.word}</div>)}
                    </div>
                    <div className={`flex justify-between mb-4 ${!isMobile ? ' h-[600px]' : ''}`}>
                        <div className="w-3/8  rounded">
                            {game.players.map((player, index) => (
                                <div
                                    className="flex justify-around items-center bg-yellow-50 p-1 border border-b-1 border-white"
                                    key={player.id}
                                >
                                    <div className="px-2">#{index + 1}</div>
                                    <div className="flex-1 text-center">
                                        <div className="font-bold">{player.username}</div>
                                        <div className="text-sm">{`Points: ${player.score}`}</div>
                                    </div>
                                    <div>{player.id === game.turn.id && <img src="" />}</div>
                                    <div className="w-10 cursor-pointer text-center text-yellow-300">
                                        <Avatar seed={player.username} alt={player.id} />
                                        <div className="text-xs">{player.id === user.id && "You"}</div>
                                        <div className="text-xs">{game.creator === player.id && "Admin"}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mx-4 w-4/8 h-5/6 flex-1" ref={videoGrid}>

                        </div>
                        {/* <button
                            className="color #fff bg-blue-300 h-5/6 w-1/8"
                            onClick={() => temporaryButton()} // put the user's id here
                        >
                            Switch Video
                        </button> */}
                        {!isMobile && (
                            <div className="flex w-1/8 flex-col bg-blue-200 px-2 h-5/6 ">
                                <div className="flex-1 flex flex-col justify-end overflow-auto" id="messages">
                                    {/* {game.messages.map((msg) => (
                            <div className={getMessageColor(msg.type)} key={msg.message}>
                                {msg.type === "normal" ? `${msg.username}: ` : ""} {msg.message}
                            </div>
                        ))} */}
                                </div>
                                <input
                                    className="w-full border border-gray rounded px-2 mb-2"
                                    placeholder="Type your guess here..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            if (message !== "") sendMessage();
                                        }
                                    }}
                                />
                            </div>
                        )}


                    </div>
                    {isMobile && (
                        < div
                            className={`flex flex-col bg-blue-200 px-2 ${isMobile ? 'h-[200px] max-h-[400px]' : 'h-3/6 max-h-96'
                                }`}
                            style={{ maxHeight: '50vh' }}
                        >
                            <div
                                className="flex-1 flex flex-col justify-end  overflow-auto"
                                id="messages"
                            // Adjust the maximum height as needed
                            >
                                {/* {game.messages.map((msg) => (
                            <div className={getMessageColor(msg.type)} key={msg.message}>
                                {msg.type === "normal" ? `${msg.username}: ` : ""} {msg.message}
                            </div>
                        ))} */}
                            </div>
                            <input
                                className="w-full border border-gray rounded px-2 mb-2"
                                placeholder="Type your guess here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        if (message !== "") sendMessage();
                                    }
                                }}
                            />
                        </div>
                    )
                    }
                </div >
            )
            }
        </div >

    );
};


