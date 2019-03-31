// $ express (만들 express 전용 폴더 명)
// $ npm i -g sequelize-cli : -g를 붙이면 명령 프롬프트에서도 사용할 수 있게 설치가 됩니다. config, megration, models, seeders 폴더 등
// $ sequelize db:create : config.json에 설정한 대로 db가 생성된다.
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes');  // index.js 생략 가능
var usersRouter = require('./routes/users');
var commentsRouter = require('./routes/comments');
var { sequelize } = require('./models');  // index.js 생략 가능

var app = express();
sequelize.sync();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/comments', commentsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;