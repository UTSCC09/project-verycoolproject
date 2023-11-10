
import React from "react";
import "./logo.css";

export default function LogoComponent() {
    return (
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img
                className="mx-auto h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt="Your Company"
            />
            <h2 className="mt-10 text-center text-8xl font-bold leading-10 text-white">
                <span className="text-outline-black">Act it out</span>
            </h2>

        </div>
    );
}

