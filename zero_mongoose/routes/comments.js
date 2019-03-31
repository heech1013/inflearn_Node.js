const express = require('express');
const router = express.Router();
const Comment = require('../schemas/comment');

// GET /comments/:id
router.get('/:id', (req, res, next) => {
  Comment.find({ commenter: req.params.id }).populate('commenter')  // (조건)commenter가 req.params.id인 댓글을 모두 가져와라 / populate(필드): sequelize의 join와 비슷한 역할. schema에서 commenter가 있는지 조사 -> commenter의 ref:'User'를 찾아서 'User'를 참조. 기존 ObjectId로 표현되던 '작성자' 항목을 알아서 해당 User의 객체(다큐먼트)로 바꿔준다. mongoose의 populate는 MySQL의 join보다는 성능이 떨어진다.
    .then((comments) => {
      res.json(comments);
    })
    .catch((error) => {
      console.error(error);
      next(error);
    });
});

router.patch('/:id', (req, res, next) => {
  // (참고)DeprecationWarning: collection.update is deprecated. Use updateOne, updateMany, or bulkWrite instead.
  Comment.update({ _id: req.params.id }, { comment: req.body.comment })  // mongoose: {조건},{수정할 내용} (<-> sequelize: {수정할 내용},{조건} )
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      console.error(error);
      next(error);
    })
});

router.delete('/:id', (req, res, next) => {
  // (참고) DeprecationWarning: collection.remove is deprecated. Use deleteOne, deleteMany, or bulkWrite instead.
  Comment.remove({ _id: req.params.id })  // (<-> sequelize: destroy )
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      console.error(error);
      next(error);
    })
});

router.post('/', (req, res, next) => {
  const post = new Comment({
    commenter : req.body.id,
    comment : req.body.comment
  });
  post.save()
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      console.error(error);
      next(error);
    })
});

module.exports = router;