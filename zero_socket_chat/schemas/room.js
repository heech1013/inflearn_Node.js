const mongoose = require('mongoose');

const { Schema } = mongoose;
const roomSchema = new Schema({
  title: {  // 채팅방 제목
    type: String,
    required: true,
  },
  max: {  // 방 최대 인원
    type: Number,
    required: true,
    default: 10,
    min: 2,  // 최솟값
  },
  owner: {
    type: String,
    required: true,
  },
  password: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Room', roomSchema);