"use client";
import React, { useState, useCallback } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/User/userSlice";

const Login = () => {
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [state, setState] = useState("signin");
    const [username, setUsername] = useState("");

    const performSignInOrSignUp = useCallback(async (path, successMessage, errorMessage) => {
        try {
            const res = await axios.post(`${backend_path}/auth/${path}`, {
                username,
                password,
            });

            setMessage(successMessage);
            dispatch(
                setUser({
                    user_id: res.data.id,
                    id: res.data.id,
                    email: res.data.email,
                    username: res.data.username,
                    access_token: res.data.access_token,
                })
            );

            if (path === "signup") {
                setTimeout(() => performSignInOrSignUp("signin", "Successfully signed in", errorMessage), 1000);
            }
        } catch (err) {
            setMessage(err.response.data.error || err.response.data.message || errorMessage);
        } finally {
            setLoading(false);
        }
    }, [dispatch, username, password]);

    const onSubmit = () => {
        setLoading(true);
        setMessage("");

        if (state === "signin" || state === "signup") {
            performSignInOrSignUp(state, "Successfully signed up, logging in...", "Sign in failed");
        }
    };


    return (
        <div className="h-full dead-center">
            {loading ? (
                <img src="/loading-white.gif" alt="loading" />
            ) : (
                <div className=" flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <img
                            className="mx-auto h-10 w-auto"
                            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                            alt="Your Company"
                        />
                        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-black-900">
                            {state == "signin" ? "Sign in to your account" : "Sign Up Now!!"}
                        </h2>
                        {message && <div className="text-center my-2">{message}</div>}
                    </div>

                    <div className=" bg-blue-200 mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form className="p-3 rounded-lg space-y-6" onSubmit={onSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                    Email address
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                                <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                                    Username
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="username"
                                        name="username"
                                        type="name"
                                        required
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                                        Password
                                    </label>
                                    <div className="text-sm">
                                        <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
                                            Forgot password?
                                        </a>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                >
                                    {state == "signin" ? "Sign In" : "Sign Up"}
                                </button>
                            </div>
                        </form>

                        {state == "signin" ? (
                            <p className="mt-10 text-center text-sm text-gray-500">
                                Not a member?{" "}
                                <a
                                    className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
                                    onClick={() => setState("signup")}
                                >
                                    Sign up Now!
                                </a>
                            </p>
                        ) : (
                            <p className="mt-10 text-center text-sm text-gray-500">
                                Already have an account?{" "}
                                <a
                                    className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
                                    onClick={() => setState("signin")}
                                >
                                    Sign in
                                </a>
                            </p>
                        )}
                    </div>
                </div>
            )};
        </div>
    );
};

export default Login;