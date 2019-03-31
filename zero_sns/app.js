const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const helmet = require('helmet');
const hpp = require('hpp');
const RedisStore = require('connect-redis')(session);  // 레디스 세션 모듈. express-session을 사용하기 때문에 더 밑에 있어야 함.
require('dotenv').config();  // .env의 내용이 process.env로 들어감!

const indexRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const { sequelize } = require('./models');
const passportConfig = require('./passport');

const app = express();
sequelize.sync();
//참고: Sync will create the tables for you, but it's not going to create the database (schema는 이미 생성이 되어있는 상태여야 한다)
passportConfig(passport);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 8001);  // process.env.PORT: 사용자(개발자)가 넣어주는 port. 없으면 8001

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));  // '배포용으로 combined정도면 충분할 것이다..' / short, common, tiny 등등이 있다.
  app.use(helmet());  // 배포용 보안
  app.use(hpp());  // 배포용 보안(hpp 공격 방어)
} else {  // development
  app.use(morgan('dev'));
}
app.use(express.static(path.join(__dirname, 'public')));  // 1param에 '/' 생략(기본값). /main.css 등으로 접근
app.use('/img', express.static(path.join(__dirname, 'uploads')));  // /img/abc.png 등으로 접근. 실제주소(/uploads)와 접근주소(/img)를 다르게 만든다. 해커들이 쉽게 서버 파일 구조를 추측 못하도록.
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));  // .env파일 참고
const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,  // cookieParser와 일치시키는 것이 동작을 예측하는 데 쉽다. .env파일 참고
  cookie: {
    httpOnly: true,
    secure: false  // https 사용
  },
  store: new RedisStore({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    pass: process.env.PASSWORD,
    logErrors: true,  // 에러 났을 때 로그 표시
  })
};
if (process.env.NODE_ENV === 'production') {
  sessionOption.proxy = true;  // 프론트와 백 사이에 프록시 서버를 따로 두는 경우에 필요
  //sessionOption.cookie.secure = true;  // https 적용하였을 때 필요. 보통 배포에는 https 적용한다.
}
app.use(session(sessionOption));
app.use(flash());  // 일회성 메시지
app.use(passport.initialize());
app.use(passport.session());  // express의 session 설정보다 아래에 위치해야 한다.

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);

// 에러처리 미들웨어
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});
app.use((err, req, res) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// app.set('~~')는 app.get('~~')로 가져올 수 있다.
app.listen(app.get('port'), () => {
  console.log(`${app.get('port')}번 포트에서 서버 실행중입니다.`);
});