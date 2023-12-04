import express from "express";
const router = express.Router();
import { RoomController } from "../controller/index.js";


router.post('/create-room', RoomController.create_room)
router.put('/add-player/:roomId/:userId', RoomController.addPlayerToRoom)
router.get('/rand-room', RoomController.get_random_room)

router.get('/check-room/:roomId', RoomController.check_room_exist)
router.get('/players/:roomId', RoomController.get_players)

router.get('/get-room/:id', RoomController.get_room_by_id)
router.delete('/delete-room/:roomId', RoomController.deleteRoom)
router.delete('/removePlayer/:roomId/:userId', RoomController.removePlayerFromRoom);


export default router