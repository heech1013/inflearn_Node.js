const KaKaoStrategy = require('passport-kakao');

const { User } = require('../models');

module.exports = (passport) => {
  passport.use(new KaKaoStrategy({
    clientID: process.env.KAKAO_ID,  // 카카오 앱 아이디
    callbackURL: '/auth/kakao/callback',  // 카카오 리다이렉트 주소 / (1) /auth/kakao => (2) 카카오 로그인(kakaoStrategy) -> (3) /auth/kakao/callback으로 프로필 반환 -> (4) kakaoStrategy async 부분 실행
  }, async (accessToken, refreshToken, profile, done) => {  // sns 로그인이기 때문에 email, pw가 아니라 token으로 로그인
    try{
      const exUser = await User.find({
        where: {
          snsId: profile.id,  // profile.id에 해당 sns의 id를 넣어서 보내준다.
          provider: 'kakao'
        }
      });
      if (exUser) {
        done(null, exUser);
      } else {
        const newUser = await User.create({
          email: profile._json && profile._json.kaccount_email,  // console.log(profile) 해보자
          nick: profile.displayName,
          snsId: profile.id,
          provider: 'kakao'  // 어떤 SNS api에서 제공한 id인지 구별
        });
        done(null, newUser);
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }))
}