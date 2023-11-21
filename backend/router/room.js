const express = require("express")
const router = express.Router()
const { RoomController } = require('../controller')

router.post('/create-room', RoomController.create_room)
router.put('/add-player/:roomId/:userId', RoomController.addPlayerToRoom)
router.get('/rand-room', RoomController.get_random_room)

router.get('/check-room/:roomId', RoomController.check_room_exist)
router.get('/players/:roomId', RoomController.get_players)

router.get('/get-room/:id', RoomController.get_room_by_id)
router.delete('/delete-room/:roomId', RoomController.deleteRoom)

module.exports = router;