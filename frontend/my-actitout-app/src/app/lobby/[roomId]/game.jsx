"use client"
import React, { useEffect, useState, useRef } from "react";

import { Avatar, Logo } from "../../../components";

import { VideoStream } from "../../../components/VideoStream/VideoStream"
import { setStartEnd, setWord, setCorrects } from "../../../store/GameRoom/gameRoomSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectGameState, selectUserState } from '../../../selectors/useSelector';
import { Peer } from "peerjs"


export default function Game(props) {


    const { roomId, socket, user } = props;

    const game = useSelector(selectGameState);

    const currentDate = new Date();
    currentDate.setSeconds(currentDate.getSeconds() + game.startEnd.end);

    const [peers, setPeers] = useState([]);
    const [streams, setStreams] = useState([]);
    const myVideo = useRef();
    const videoGrid = useRef(null);
    const peersRef = useRef([]);
    const myPeer = useRef();


    const [message, setMessage] = useState("");
    const dispatch = useDispatch();

    let currentPlayerId = null; // This will control who's video is being played

    const useCounter = (endTimeStamp) => {
        const [timeLeft, setTimeLeft] = useState(0);

        useEffect(() => {
            const timer = setInterval(() => {
                const now = new Date();
                const nowTimeStamp = now.getTime();
                const diff = endTimeStamp - nowTimeStamp;
                const seconds = Math.floor(diff / 1000);
                if (seconds < 0) {
                    console.log("here");
                    socket.emit("round-end", { roomId: roomId, players: game.players })
                    clear();
                } else {
                    //console.log(seconds);
                    setTimeLeft(seconds);
                }
            }, 1000);

            const clear = () => {
                clearInterval(timer);
            };

            return () => {
                clear();
            };
        }, [endTimeStamp]);

        return timeLeft;
    };

    let timeLeft = useCounter(currentDate);

    const sendMessage = () => {
        if (message === game.word) {
            console.log('correct')
            socket.emit('correct-guess', { roomId: roomId })
            if (game.corrects >= game.players.length) {
                socket.emit("round-end", { roomId: roomId, players: game.players })
            }
        }
        socket.emit('message', { message: message, roomId: roomId });
        // socket.emit('new-round', { message: message, roomId: roomId });
        // socket.emit("message", message);
        setMessage("");
    };

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
            console.log("Set stream of: " + userId + " to " + streams[userId])
        });
        call.on('close', () => {
            video.remove();
        });
        peers[userId] = call;
    }

    function switchVideo(userId) {
        if (videoGrid.current) {
            const video = document.createElement('video');
            addVideoStream(video, streams[userId]);
            videoGrid.current.innerHTML = "";
            videoGrid.current.appendChild(video);
            console.log("Playing stream of: " + userId + " | " + streams[userId])
        }
    }

    const setupPeers = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        });

        myVideo.current = document.createElement('video');

        myPeer.current = new Peer(user.id); //user.id not initialized??

        myPeer.current.on('open', id => {
            addVideoStream(myVideo.current, stream);
            streams[myPeer.current.id] = stream;
            console.log("Set stream of: " + myPeer.current.id + " to " + streams[myPeer.current.id])
            myPeer.current.on('call', call => {
                call.answer(stream);
                const video = document.createElement('video');
                call.on('stream', userVideoStream => {
                    addVideoStream(video, userVideoStream);
                    streams[call.peer] = userVideoStream
                    console.log("Set stream of: " + call.peer + " to " + streams[call.peer])
                });
            });

            socket.on('user-connected', userId => {
                connectToNewUser(userId, stream);
            });

            socket.on('user-disconnected', userId => {
                if (peers[userId]) {
                    peers[userId].close();
                    delete peers[userId];
                }
                if (streams[userId]) {
                    delete streams[userId];
                }
            });
        })

    }

    useEffect(() => { //make sure the sockets only render once and are deleted on any rerenders
        //socket.emit('join-room', roomId, user.id);
        setupPeers();


        socket.on("new-word", (data) => {
            dispatch(setWord(data));
        })

        socket.on("new-round", (data) => { // When a new round is emitted from server, it will send the new round endTimer
            const { endTimer, player } = data
            timeLeft = useCounter(endTimer);
            currentPlayerId = player;
            switchVideo(currentPlayerId);

        })

        socket.on("update-correct-guess", (data) => {
            dispatch(setCorrects(game.corrects + 1));
            if (game.corrects >= game.players.length) {
                socket.emit("round-end", { roomId: roomId, players: game.players })
            }
        })

        return () => {
            socket.off("new-message");
            socket.off("new-word");
        };
    }, []);


    useEffect(() => { // If a player disconnects, we need to check if the next round should start
        if (game.corrects >= game.players.length) {
            socket.emit("round-end", { roomId: roomId, players: game.players })
        }
    }, [game.players])


    // console.log(game.startEnd.end);

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

    function temporaryButton() {
        socket.emit("new-round", { roomId: roomId, players: game.players });
    }



    return (
        <div className="flex flex-col">
            <div className="h-32"><Logo /></div>;

            <div className="rounded flex items-center bg-blue-50 mb-3 px-5 py-2 font-bold text-gray-600">
                <div>
                    {timeLeft} <span className="ml-3">Round {game.curr_round} of {game.rounds}</span>
                </div>
                <div className="text-center flex-1 tracking-[3px]">{game.word}</div>
            </div>
            <div className="flex justify-between h-[600px]">
                <div className="w-3/8  rounded">
                    {game.players.map((player) => (
                        <div
                            className="flex justify-around items-center bg-yellow-50 p-1 border border-b-1 border-white"
                            key={player.id}
                        >
                            <div className="px-2">#1{player.rank}</div>
                            <div className="flex-1 text-center">
                                <div className="font-bold">{player.username}</div>
                                <div className="text-sm">Points:10 {player.points}</div>
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
                <button
                    className="color #fff bg-blue-300 h-5/6 w-1/8"
                    onClick={() => temporaryButton()} // put the user's id here
                >
                    Switch Video
                </button>

                <div className="flex w-1/8 flex-col bg-blue-200 px-2 h-5/6">
                    <div className="flex-1 flex flex-col justify-end overflow-auto" id="messages">
                        {game.messages.map((msg) => (
                            <div className={getMessageColor(msg.type)} key={msg.message}>
                                {msg.type === "normal" ? `${msg.username}: ` : ""} {msg.message}
                            </div>
                        ))}
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
            </div>
        </div>
    );
};


