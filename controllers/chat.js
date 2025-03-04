// controllers/chat.js
import ChatRoom from '../models/chatroom.js'
import { StatusCodes } from 'http-status-codes'

export async function createOrGetRoom(req, res) {
    try {
        const { targetUserId } = req.body
        if (!targetUserId) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: '缺少 targetUserId',
            })
        }

        // 假設 req.user._id 為字串（或轉換成字串）
        const currentUserId = req.user._id.toString()
        const targetId = targetUserId.toString()
        const roomKey = [currentUserId, targetId].sort().join('_')

        let room = await ChatRoom.findOne({ roomKey })
        if (!room) {
            try {
                room = await ChatRoom.create({ participants: [currentUserId, targetId] })
            } catch (err) {
                // 如果發生 duplicate key error，表示另一個請求已建立房間，重新查詢一次
                if (err.code === 11000) {
                    room = await ChatRoom.findOne({ roomKey })
                } else {
                    throw err
                }
            }
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: '房間取得成功',
            room,
        })
    } catch (error) {
        console.error('createOrGetRoom error:', error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: '建立或取得房間失敗',
        })
    }
}

export async function getUserRooms(req, res) {
    try {
        // 假設 req.user._id 為字串或可以轉換為字串
        const userId = req.user._id.toString()

        // 查詢所有 participants 陣列中包含該用戶的聊天室
        const rooms = await ChatRoom.find({ participants: userId })

        res.status(StatusCodes.OK).json({
            success: true,
            message: '取得聊天室成功',
            result: rooms,
        })
    } catch (error) {
        console.error('getUserRooms error:', error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: '取得聊天室失敗',
        })
    }
}

import Message from '../models/message.js'

export async function getMessages(req, res) {
    try {
        const { roomId } = req.query
        const messages = await Message.find({ room: roomId }).sort({ createdAt: 1 })
        res.status(StatusCodes.OK).json({
            success: true,
            message: '',
            result: messages,
        })
    } catch (error) {
        console.error('getMessages error:', error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: '取得訊息失敗',
        })
    }
}

export async function sendMessage(req, res) {
    try {
        const { roomId, content } = req.body
        // 假設 req.user._id 為發送者ID
        const senderId = req.user._id.toString()

        // 建立訊息記錄
        const newMessage = await Message.create({ room: roomId, senderId, content })

        // 可額外處理，例如更新聊天室的 lastMessage 等
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: '訊息已儲存',
            result: newMessage,
        })
    } catch (error) {
        console.error('sendMessage error:', error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: '儲存訊息失敗',
        })
    }
}
