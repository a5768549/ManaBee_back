// routes/chat.js
import express from 'express'
import * as auth from '../middlewares/auth.js'
import { createOrGetRoom, getMessages, sendMessage, getUserRooms } from '../controllers/chat.js'

const router = express.Router()

router.get('/rooms', auth.jwt, getUserRooms)
router.post('/room', auth.jwt, createOrGetRoom)
router.get('/messages', auth.jwt, getMessages)
router.post('/messages', auth.jwt, sendMessage)

export default router
