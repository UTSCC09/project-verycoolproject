const express = require("express")
const app = express();
const server = require("http").Server(app)
const io = require("socket.io")(server)
const { v4 } = require('uuid')

app.set('view engine', 'ejs')
app.use('/game', express.static('public'))

app.get('/game/', (req, res) => {
    res.redirect(`/game/${v4()}`)
})

app.get('/game/:room', (req, res) => {
    res.render('room', {roomId: req.params.room})
})

io.on(`connection`, socket => {
    socket.on('join-room', (roomId, userId) => {
        console.log("Room ID: " + roomId + " | User ID: " + userId)
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })
})

server.listen(4000, () => console.log("Server running on port 4000."))