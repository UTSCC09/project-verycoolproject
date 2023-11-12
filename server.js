const express = require("express")
const app = express();
const server = require("http").Server(app)
const io = require("socket.io")(server)
const { v4 } = require('uuid')

app.get('/', (req, res) => {
    res.redirect(`/${v4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', {roomId: req.params.room})
})

io.on(`connection`, socket => {
    socket.on('join-room', (roomId, userId))
})

server.listen(4000)