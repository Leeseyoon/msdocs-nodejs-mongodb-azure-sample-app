const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, maxlength: 50 },
  title: { type: String, required: true, maxlength: 255 },
  created_at: { type: Date, required: true },
  flag: { type: Number, default: 0 }
});

chatSchema.index({ id: 1 });

module.exports = mongoose.model('Chat', chatSchema);