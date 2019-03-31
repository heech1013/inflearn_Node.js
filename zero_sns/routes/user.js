const express = require('express');

const router = express.Router();
const { User } = require('../models');
const { isLoggedIn } = require('./middlewares');

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.find({ where: { id: req.user.id }});  // 현재 '나'를 찾는다
    await user.addFollowing(parseInt(req.params.id, 10));  // A.addB: 관계 생성
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:id/unfollow', isLoggedIn, async (req, res, next) => {  // rest api에 맞게 delete /:id/follow 해도 되구
  try {
    const user = await User.find({ where: { id: req.user.id }});  // 현재 '나'를 찾는다
    await user.removeFollowing(parseInt(req.params.id, 10));  // A.remiveB: 관계 제거
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/profile', async (req, res, next) => {
  try {
    await User.update({ nick: req.body.nick }, {
      where: { id: req.user.id }
    });
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;