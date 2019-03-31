const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();

// POST /auth/join
// router.get(미들웨어1, 미들웨어2, 미들웨어3, ...): 미들웨어 1, 2, 3, ... 순서대로 미들웨어가 실행됨. '/join'으로 들어오면, isNotLoggedIn이 먼저 실행, 로그인된 사람은 '/'로 이동하고 로그인되지 않은 사람은 next()로 인해 async()가 실행된다.
router.post('/join', isNotLoggedIn, async (req, res, next) => {  // isNotLoggedIn: 현재 로그인 되어있는 사람은 회원가입을 할 이유가 없다.
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.find({ where: { email } });
    if (exUser) {
      req.flash('joinError', '이미 가입된 이메일입니다.');
      return res.redirect('/join');
    }
    //console.time('암호화 시간');
    const hash = await bcrypt.hash(password, 12);  // 숫자가 클수록 암호는 복잡하고 암호화도 느려진다. 1초 정도 걸릴 때까지 수를 늘리는 것을 추천
    //console.timeEnd('암호화 시간);
    await User.create({
      email,
      nick,
      password: hash
    });
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// POST /auth/login
router.post('/login', isNotLoggedIn, (req, res, next) => {  // req.body.email, req.body.password 전달 / isNotLoggedIn: 마찬가지로 로그인이 되지 않은 상태인 사용자만 로그인을 할 수 있다.
  passport.authenticate('local', (authError, user, info) => {  // localStrategy를 수행한다 -> localStrategy.js의 done(에러, 성공, 실패) 결과에 따라 에러:authError, 성공:user, 실패:info(메시지)를 전달 받음.
    if (authError) {
      console.error(authError);
      return next(error);
    }
    if (!user) {
      req.flash('loginError', info.message);  // info = { message: '~' }
      return res.redirect('/');
    }
    return req.login(user, (loginError) => {  // passport에 새로 추가된 내장함수 login() / 로그인 후에는 req.user에서 사용자 정보를 찾을 수 있다.
      if (loginError) {  // done에서 성공으로 넘어왔는데 login에서 error 터지는 경우 방지. 거의 그럴 일 없지만 혹시 모르는 곳에 모두 에러처리를 해놓는 것이 좋다.
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next);
});

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout();
  res.redirect('/');
});


router.get('/kakao', passport.authenticate('kakao'));  // kakaoStrategy가 실행됨.
router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/',  // 실패했을 때
}), (req, res) => {  // 성공했을 때
  res.redirect('/');
});  // kakaoStrategy.js의 콜백설정과 주소가 일치해야 한다.

module.exports = router;