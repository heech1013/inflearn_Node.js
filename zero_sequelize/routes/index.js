var express = require('express');
var router = express.Router();
var { User } = require('../models');

/* GET home page. */
router.get('/', function(req, res, next) {
  User.findAll()
    .then((users) => {
      res.render('sequelize', { title: '시퀄라이즈 연습', users });  // ES6 문법으로 users:users 생략
    })
    .catch((err) => {
      console.error(err);
      next(err);
    });  
});

module.exports = router;