const mongoose = require('mongoose');

const { Schema } = mongoose;  // mongoose의 속성을 비구조화 할당으로 꺼내온다.
const { Types: ObjectId } = Schema;  // **Schema의 Types 객체 안에 ObjectId가 들어있다!
const commentSchema = new Schema({ 
  commenter: {
    type: ObjectId,  // **관계 설정 대신 다른 스키마를 참조하는 방법.
    required: true,
    ref: 'User'  // **어떤 스키마를 참조하는가?
  },
  comment: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
// _id, 작성자, 댓글내용, 생성일
module.exports = mongoose.model('Comment', commentSchema);  // mongoose.model(<모델명>, <스키마>, <컬렉션명>)