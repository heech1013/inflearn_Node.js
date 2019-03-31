const mongoose = require('mongoose');

const { Schema } = mongoose;  // mongoose의 속성을 비구조화 할당으로 꺼내온다.
const userSchema = new Schema({ 
  // 설정도 js 문법을 따른다.
  // _id는 알아서 생성해준다.
  name: {
    type: String,
    required: true,
    unique: true
  },
  age: {
    type: Number,
    required: true
  },
  married: {
    type: Boolean,
    required: true
  },
  comment: String,  // 조건이 하나 밖에 없는 경우 이렇게 줄일 수 있다.
  createdAt: {
    type: Date,
    default: Date.now
  }
});
// _id, 이름, 나이, 결혼여부, 자기소개, 생성일
module.exports = mongoose.model('User', userSchema);  // mongoose.model(<모델명>, <스키마>, <컬렉션명>)