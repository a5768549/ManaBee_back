import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import { StatusCodes } from 'http-status-codes'

// 手動建立 http server
import { createServer } from 'node:http'
import { Server } from 'socket.io'

// 路由
import routerUser from './routers/user.js'
import routerChat from './routers/chat.js'

import cors from 'cors'

// use passport 驗證策略
// import strategies from './passport/strategies.js'
// strategies.useAll()

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*',
    },
})

// cors 全開
app.use(cors())

// 錯誤處理
app.use(express.json())
app.use((error, req, res, next) => {
    res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'requestFormatError',
    })
})

// 路由
app.use('/user', routerUser)
app.use('/chat', routerChat)

import Message from './models/message.js'

// 📌 WebSocket
io.on('connection', (socket) => {
    console.log('新用戶連接:', socket.id)

    // joinRoom
    socket.on('joinRoom', (room) => {
        socket.join(room)
        console.log(`User ${socket.id} joined room ${room}`)
    })

    // sendMessage
    socket.on('sendMessage', async (msg) => {
        try {
            // msg 內容格式：{ roomId, content, senderId }
            const newMsg = await Message.create({
                room: msg.roomId,
                senderId: msg.senderId,
                content: msg.content,
            })
            // 廣播訊息給該聊天室內的所有用戶
            io.to(msg.roomId).emit('receiveMessage', newMsg)
        } catch (error) {
            console.error('Socket sendMessage error:', error)
        }
    })

    // disconnect
    socket.on('disconnect', () => {
        console.log('用戶離開:', socket.id)
    })
})

// 📌 啟動server 本來都是 app.listen websocket 掛在 server 上 所以用 server.listen
server.listen(process.env.PORT || 4000, async () => {
    try {
        // server 啟動
        console.log('listening on port', process.env.PORT || 4000)
        // 連線資料庫
        await mongoose.connect(process.env.DB_URL)
        // mongoose 內建的消毒 防注入
        mongoose.set('sanitizeFilter', true)
        console.log('資料庫連線成功')
    } catch (error) {
        console.log(' connect error: ' + error)
    }
})
