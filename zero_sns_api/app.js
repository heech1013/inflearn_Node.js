const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
require('dotenv').config();  // .env의 내용이 process.env로 들어감!

const { sequelize } = require('./models');
const passportConfig = require('./passport');
const indexRouter = require('./routes/page');
const authRouter = require('./routes/auth');

const app = express();
sequelize.sync();
//참고: Sync will create the tables for you, but it's not going to create the database (schema는 이미 생성이 되어있는 상태여야 한다)
passportConfig(passport);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 8001);  // process.env.PORT: 사용자(개발자)가 넣어주는 port. 없으면 8001

app.use(morgan('dev'));  // logger
app.use(express.static(path.join(__dirname, 'public')));  // 1param에 '/' 생략(기본값). /main.css 등으로 접근
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));  // .env파일 참고
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,  // cookieParser와 일치시키는 것이 동작을 예측하는 데 쉽다. .env파일 참고
  cookie: {
    httpOnly: true,
    secure: false  // https 사용
  }
}));
app.use(flash());  // 일회성 메시지
app.use(passport.initialize());
app.use(passport.session());  // express의 session 설정보다 아래에 위치해야 한다.

app.use('/', indexRouter);
app.use('/auth', authRouter);

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