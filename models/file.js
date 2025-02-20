const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    _id: { type: String, required: true },  // UUID를 _id로 사용
    originalName: { type: String, required: true },
    hashName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    chatId: { type: String, required: true, ref: 'Chat' }
}, {
    timestamps: true
});

module.exports = mongoose.model('File', fileSchema);