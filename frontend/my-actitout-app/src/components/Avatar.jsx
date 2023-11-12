import React from "react";

export default function AvatarComponent(props) {
    const { seed } = props;
    return (
        <img
            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`}
            className="hover:scale-110 duration-75"
        />
    );
}
