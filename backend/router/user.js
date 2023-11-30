import express from "express";
const router = express.Router();
import { UserController } from "../controller/index.js";

// For company text data
router.post('/add', UserController.create_new_user);
router.get('/all', UserController.get_all_user);
router.get('/:id', UserController.get_user_by_id);
router.put('/:id', UserController.update_user);
router.delete('/:id', UserController.delete_user);
router.get('/by-room/:roomId', UserController.get_users_by_romm);

export default router;
