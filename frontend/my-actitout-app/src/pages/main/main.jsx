"use client";
import { useEffect, useState } from "react";
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import DOMPurify from 'dompurify'
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser, set_username } from "../../store/User/userSlice";
import Load from "../../../public/loading-white.gif"
import { Logo } from "../../components"


function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const Main = () => {
    const [avatarSvg, setAvatarSvg] = useState("");
    const { username, user } = useSelector((state) => ({
        username: state.user.username ?? "Lord",
        user: state.user,

    }));
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const query = useQuery();

    useEffect(() => {
        setAvatarSvg(
            createAvatar(adventurer, {
                seed: username,
            })
        );
    }, [username]);

    const playGame = async () => {
        const gameId = query.get("id");
        setLoading(true);
        if (gameId) {
            navigate(`lobby/${gameId}`);
            setLoading(false);
        } else {
            try {
                // const res = await axios.get(`${backend_path}/game/find`, {
                //     headers: {
                //         Authorization: user.access_token,
                //     },
                // });

                // const data = res.data;

                // if (data.gameId.length > 0) {
                //     navigate(`lobby/${data.gameId}`);
                //     setLoading(false);
                // } else {
                //     createGame();
                // }
                navigate(`game`);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        }
    };

    const createGame = async () => {
        setLoading(true);

        try {
            // const res = await axios.post(
            //     `${backend_path}/game/create`,
            //     {
            //         username,
            //     },
            //     {
            //         headers: {
            //             Authorization: user.access_token,
            //         },
            //     }
            // );

            // const data = res.data;

            // console.log(res);
            navigate(`lobby`);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="h-full dead-center">
            {loading ? (
                <img src={Load} alt="loading" />
            ) : (
                <div className=" flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                    <Logo />
                    <div className="bg-blue-300 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form className="p-3 rounded-lg space-y-6">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                                    Hello {username}
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="username"
                                        name="username"
                                        type="name"
                                        value={username}
                                        required
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        onChange={(e) =>
                                            dispatch(set_username(e.target.value))
                                        }
                                    />
                                </div>
                                <div className="my-2 flex justify-center w-full">
                                    <div
                                        className="h-40 w-40"
                                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(avatarSvg) }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <button
                                    className="block bg-green-500 hover:bg-green-600 w-full text-white rounded h-10 mt-4 mb-1"
                                    onClick={playGame}
                                >
                                    Play
                                </button>
                                <button
                                    className="block bg-green-500 hover:bg-green-600 w-full text-white rounded h-10 mt-4 mb-1"
                                    onClick={createGame}
                                >
                                    Create A Game
                                </button>
                            </div>


                        </form>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Main;
