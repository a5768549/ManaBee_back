// models/Message.js
import { Schema, model } from 'mongoose'

const messageSchema = new Schema(
    {
        room: { type: String, required: true }, // 聊天室ID（字串）
        senderId: { type: String, required: true }, // 發送者ID（字串）
        content: { type: String, required: true }, // 訊息內容
    },
    { timestamps: true }, // 自動產生 createdAt, updatedAt
)

export default model('Message', messageSchema)
