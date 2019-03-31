const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const { User } = require('../models');

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);  // 몽고디비의 경우에는 user._id
  });  // user 정보 전체가 아닌 고유 id만을 가지고 간다.

  // 로그인 후, 사용자가 보내는 여러 요청마다 app.js의 미들웨어를 위에서부터 아래로 쭉 타고 내려온다. 그러다 passport.session()을 만나면 deserializeUser()가 실행됨.
  passport.deserializeUser((id, done) => {
    User.find({ 
      where: { id },
      include: [{  // 팔로워, 팔로잉 관계를 req.user에 넣는다.
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers'
      }, {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followings'
      }]
    })
      .then(user => done(null, user))  // 고유 id를 통해 user 정보를 다시 찾은 다음, req.user에 저장
      .catch(err => done(err));
  });
  // 실무 팁! deserializeUser는 매 요청마다 쿼리문을 통해 user정보를 요청한다. 디비 요청은 적을 수록 좋기 때문에 실무에서는 디비 조회를 캐싱하여 효율적으로 만든다.
  /* 실무 코드 예시(간단한 장치 느낌이라고 한다. 실제로는 더 효율적인 방법이 있는듯? '캐싱'?)
  모듈 밖 상단: const user = {};
  모듈 안:
    passport.deserializeUser((id, done) => {
      if (user[id]) {
        done(user[id]);
      } else {
        User.find({ where: { id } })
          .then(user => done(null, user))
          .catch(err => done(err));
      }    
    });
  */
  
  local(passport);
  kakao(passport);
};