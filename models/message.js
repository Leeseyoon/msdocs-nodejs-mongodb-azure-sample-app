const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    chat_id: { type: String, required: true },
    sender: { type: String, required: true, enum: ['user', 'assistant'] },
    text: { type: String, required: true },
    flag: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
    fileId: { type: String, ref: 'File' }  // 파일 첨부 기능을 위한 필드
});

// 채팅 ID와 타임스탬프로 인덱스 생성
messageSchema.index({ chat_id: 1, timestamp: 1 });

module.exports = mongoose.model('Message', messageSchema);