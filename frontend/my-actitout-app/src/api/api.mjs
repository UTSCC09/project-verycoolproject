"use client"
function send(method, url, data) {
    return fetch(`${process.env.NEXT_PUBLIC_BACKEND}${url}`, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: data ? JSON.stringify(data) : null,
    })
        .then((response) => {
            return response.json()
        })
        .catch((error) => {
            console.error("Error in API request:", error);
            throw error;
        });
}



export function getUsername() {
    const usernameMatch = document.cookie.match(/(?:^|; )username=([^;]*)/);
    if (usernameMatch) {
        const decodedUsername = decodeURIComponent(usernameMatch[1]);
        return decodedUsername;
    } else {
        return null; // or any other default value you want
    }
}





export function createUser(username) {
    return send("POST", "/user/add", { username: username });
}

export function get_players(roomId) {
    return send("GET", `/room/players/${roomId}`, null);
}
export function createRoom(userId) {
    return send("POST", "/room/create-room", { userId: userId });
}

export function addPlayerToRoom(roomId, userId) {
    return send("PUT", `/room/add-player/${roomId}/${userId}`, null);
}
export function getRandomRoom() {
    return send("GET", `/room/rand-room`, null);
}

export function getRoomById(roomId) {
    return send("GET", `/room/get-room/${roomId}`, null);
}

export function deleteRoom(roomId) {
    return send("DELETE", `/room/delete-room/${roomId}`, null);
}

export function deleteUser(userId) {
    return send("DELETE", `/user/${userId}`, null);
}

//DON'T DELETE THIS ONE
export function getPlayersByRoom(roomId) {
    return send("GET", `/user/by-room/${roomId}`, null);
}
