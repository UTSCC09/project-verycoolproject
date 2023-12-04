import React from 'react';
import { Avatar } from "../../../components";

import { useDispatch } from "react-redux";
import { showLobby } from "../../../store/GameRoom/gameRoomSlice";
import { useRouter } from 'next/navigation';


export default function UserRankings(props) {

    const { players } = props
    const dispatch = useDispatch();
    const { push, back, replace } = useRouter();

    // Split the players into top 3 and the rest
    const top3Players = players.slice(0, 3);
    const otherPlayers = players.slice(3);

    return (
        <div className="flex flex-col items-center bg-blue-100 p-8">
            <h1 className="text-4xl font-bold mb-4">Game Over!</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {top3Players.map((player,index) => (
                    <div
                        key={index}
                        className={`flex  items-center justify-between p-3 rounded-md aspect-w-1 aspect-h-1 ${index === 0
                            ? 'bg-yellow-300' // Adjust the shade as needed
                            : index === 1
                                ? 'bg-gray-300' // Adjust the shade as needed
                                : index === 2
                                    ? 'bg-orange-300' // Adjust the shade as needed
                                    : 'bg-gray-800 text-white'
                            }`}
                    >
                        <div className="flex flex-col">
                            <div> <Avatar seed={player.username} alt={player.id} />
                                <div className={`text-lg font-medium mt-2 ${index === 0 ? 'text-yellow-700' : 'text-gray-700'}`} style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.8)' }}>
                                    {player.username}
                                </div></div>

                        </div>
                        <div className="text-lg font-bold mt-2">Rank {index+1}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-8">
                {otherPlayers.map((player,index) => (
                    <div
                        key={player.id}
                        className={`flex  items-center justify-between p-2 rounded-md aspect-w-1 aspect-h-1 transform transition-transform duration-300 hover:scale-105`}
                    >
                        <div className="flex flex-col">
                            <div> <Avatar seed={player.username} alt={player.id} />
                                <div className="text-sm font-medium mt-2">{player.username}</div>
                            </div>
                        </div>
                        <div className="text-sm mt-2">Rank {index + 4}</div>

                    </div>
                ))}
            </div>
            <button
                onClick={() => {dispatch(showLobby()) ; push("/")} }
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold my-5 py- px-4 rounded"
            >
                Leave Game
            </button>
        </div >
    );
}
