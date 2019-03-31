var express = require('express');
var router = express.Router();
const User = require('../schemas/user');  // mongoose는 sequelize와 다르게 모델을 직접 스키마에서 바로 가져온다. (sequelize의 경우 schema/index.js -> models/index.js를 통해 가져온다)

/* GET home page. */
router.get('/', function(req, res, next) {
  User.find()  // 모두 가져오기 (<-> sequelize: findAll)
    .then((users) => {
      res.render('mongoose', { title: 'Express', users });
    })
    .catch((error) => {
      console.error(error);
      next(error);
    });
});

module.exports = router;
