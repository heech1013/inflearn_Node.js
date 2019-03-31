const mongoose = require('mongoose');
const { Schema } = mongoose;

const favoriteSchema = new Schema({
  placeId: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  location: { type: [Number], index: '2dsphere' },  // 몽고DB에서 기본적으로 제공하는 경도, 위도 자료형. 경도-위도 순서임.
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Favorite', favoriteSchema);