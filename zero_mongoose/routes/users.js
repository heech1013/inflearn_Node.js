var express = require('express');
var router = express.Router();
const User = require('../schemas/user');

// GET /users
router.get('/', (req, res, next) => {
  User.find()
  .then((users) => {
    res.json(users);
  })
  .catch((error) => {
    console.error(error);
    next(error);
  });
});

router.post('/', (req, res, next) => {
  const user = new User({  // (<-> sequelize: user.create)
    name: req.body.name,
    age: req.body.age,
    married: req.body.married
  });
  user.save()  // 저장
    .then((result) => {
      res.status(201).json(result);
    })
    .catch((error) => {
      console.error(error);
      next(error);  // 에러처리 미들웨어로 넘긴다.
    });
});

module.exports = router;
