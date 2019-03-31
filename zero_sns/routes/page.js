const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User } = require('../models');

const router = express.Router();
// 프론트에서 오는 정보들을 믿지 마라. 최대한 예외상황 없애주기.

// 프로필 페이지
router.get('/profile', isLoggedIn,  (req, res, next) => {  // 로그인 된 사용자만 프로필을 볼 수 있도록
  res.render('profile', { title: '내 정보 - NodeBird', user: req.user });
});
// 회원가입 페이지
router.get('/join', isNotLoggedIn, (req, res, next) => {  // 로그인 되지 않은 사람들만 회원가입 할 수 있도록
  res.render('join', {
    title: '회원가입 - NodeBird',
    user: req.user,
    joinError: req.flash('joinError')
  });
});
// 메인 페이지
router.get('/', (req, res, next) => {
  Post.findAll({
    include: [{  // 게시물 작성자와 관계 설정
      model: User,
      attributes: ['id', 'nick']
    }, {
      model: User,
      attributes: ['id', 'nick'],
      as: 'Liker'  // include에서 같은 모델이 여러 개면 as로 구분한다.
    }]
  })
    .then((posts) => {
      console.log(posts);
      res.render('main', {
        title: "NodeBird",
        twits: posts,
        user: req.user,  // deserializeUser로부터 받음(passport/index.js 참고)
        loginError: req.flash('loginError')
      });
    })
    .catch((error) => {
      console.error(error);
      next(error);
    });
});

module.exports = router;