import express from "express";
import { createUser, getAllUsers, userLogin } from "../controller/user";


const router = express.Router();
router.post('/register', createUser)
router.post('/login', userLogin)

router.get('/allusers', getAllUsers)

export default router;