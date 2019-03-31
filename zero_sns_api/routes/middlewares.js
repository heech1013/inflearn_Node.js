exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {  // passport 추가 내장함수 req.isAuthenticated(): 로그인 여부를 알려준다.
    next();
  } else {  // 하고싶은대로.
    res.status(403).send('로그인 필요');
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {  // 하고싶은대로.
    res.redirect('/');
  }
};