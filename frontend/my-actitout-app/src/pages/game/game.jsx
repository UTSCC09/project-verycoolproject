import React, { useEffect, useState } from "react";

// import WhiteBoard from "../Components/WhiteBoard";
import { Avatar, Logo } from "../../components";
// import Brush from "../assets/img/pen.gif";
import { VideoStream } from "../../components/VideoStream/VideoStream"
import { setStartEnd } from "../../store/GameRoom/gameRoomSlice";
import { useDispatch, useSelector } from "react-redux";

const currentDate = new Date();
currentDate.setSeconds(currentDate.getSeconds() + 60);

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


export default function Game(props) {
    // const { gameId, user } = props;
    const game = useSelector((state) => state.game);
    const user = useSelector((state) => state.user);

    const [message, setMessage] = useState("");
    const dispatch = useDispatch();

    const sendMessage = () => {
        console.log('sednd msg to socket');
        setMessage("");
    };

    useEffect(() => {
        dispatch(setStartEnd({ start: 0, end: 60 }));
    }, []);


    // console.log(game.startEnd.end);
    const timeLeft = useCounter(currentDate);

    const getMessageColor = (type) => {
        switch (type) {
            case "join":
                return "text-green-400";
            case "correct":
                return "text-green-600";
            case "leave":
                return "text-red-400";
            default:
                return "";
        }
    };


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
                <div className="mx-4 w-4/8 h-5/6 flex-1">
                    <VideoStream />
                </div>

                <div className="flex w-1/8 flex-col bg-blue-200 px-2 h-5/6">
                    <div className="flex-1 flex flex-col justify-end overflow-auto">
                        <div key={"gello"}>
                            lord: hello
                        </div>
                        {game.messages.map((msg) => (
                            <div className={getMessageColor(msg._type)} key={msg.message}>
                                {msg._type === "normal" ? `${msg.username}: ` : ""} {msg.message}
                            </div>
                        ))}
                    </div>
                    <input
                        className="w-full border border-gray rounded px-2 mb-2"
                        placeholder="Type your guess here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};


