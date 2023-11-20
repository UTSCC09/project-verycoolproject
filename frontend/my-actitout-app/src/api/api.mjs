function send(method, url, data) {
    console.log(method, url, data);
    console.log(process.env.NEXT_PUBLIC_BACKEND, url);
    return fetch(`${process.env.NEXT_PUBLIC_BACKEND}${url}`, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: data ? JSON.stringify(data) : null,
    })
        .then((response) => response.json())
        .catch((error) => {
            console.error("Error in API request:", error);
            throw error;
        });
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

