const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { User } = require('../models');

module.exports = (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'email',  // req.body.email (클라이언트의 form 태그의 post 형식과 일치해야 한다)
    passwordField: 'password'  // req.body.password
  }, async (email, password, done) => {  // done(에러, 성공, 실패) :: done(서버에러) / done(null, 사용자 정보) / done(null, false, 실패 정보)
    try{
      const exUser = await User.find({ where: { email }});
      if (exUser) {
        // 비밀번호 검사
        const result = await bcrypt.compare(password, exUser.password);  // true or false
        if (result) {
          done(null, exUser);
        } else {
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }
      } else{
        done(null, false, { message: '가입되지 않은 회원입니다.' });
        // 배포 시에는 '이메일-비밀번호 조합이 맞지 않습니다'꼴로 같은 메시지를 주어야 보안에 덜 취약하다.
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
}