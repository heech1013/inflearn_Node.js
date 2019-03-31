const mongoose = require('mongoose');

const { MONGO_ID, MONGO_PASSWORD, NODE_ENV } = process.env;
const MONGO_URL = `mongodb://localhost:27017/admin`;  // 몽고디비 접속주소

module.exports = () => {
    // 원래의 URL 형식: 'mongodb://<아이디>:<비밀번호>@<몽고디비 주소>/admin' / 로그인 하기 위해 admin으로 설정. 실제 사용하는 db는 2param에 설정
    // 비밀번호에 '@'가 포함되어 있어 오류가 나므로 약간 다른 형식을 사용한다.
  const connect = () => {
    mongoose.connect(MONGO_URL, {
      user: MONGO_ID,
      pass: MONGO_PASSWORD,
      dbName: 'gifchat',
    }, (error) => {
      if (error) {
        console.log('몽고디비 연결 에러', error);
      }
    });
  };
  connect();

  mongoose.connection.on('error', (error) => {
    console.error('몽고디비 연결 에러', error);
  });
  mongoose.connection.on('disconnected', () => {
    console.error('몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.');
    connect();
  });

  require('./chat');
  require('./room');
}
