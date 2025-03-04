import { Schema, model } from 'mongoose'

const chatRoomSchema = new Schema(
    {
        participants: [{ type: String, required: true }],
        roomKey: { type: String, unique: true }, // 新增的複合鍵欄位，確保相同組合唯一
    },
    { timestamps: true },
)

// 每次儲存之前，根據 participants 排序生成 roomKey
chatRoomSchema.pre('save', function (next) {
    if (this.participants && this.participants.length) {
        // 排序後以 '_' 連接
        this.roomKey = this.participants.slice().sort().join('_')
    }
    next()
})

export default model('ChatRoom', chatRoomSchema)
