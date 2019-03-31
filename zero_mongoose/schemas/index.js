const mongoose = require('mongoose');

module.exports = () => {
  const connect = () => {
    if (process.env.NODE_ENV !== 'production') {  // 배포용 설정이 아니라면, (node 환경변수에 대해 알아보자..)
      mongoose.set('debug', true);  // debug모드로 실행한다(error가 나면 error가 뜨는 설정)
    }
    // 원래의 URL 형식: 'mongodb://<아이디>:<비밀번호>@<몽고디비 주소>/admin' / 로그인 하기 위해 admin으로 설정. 실제 사용하는 db는 2param에 설정
    // 비밀번호에 '@'가 포함되어 있어 오류가 나므로 약간 다른 형식을 사용한다.
    mongoose.connect('mongodb://localhost:27017/admin', {
      user: 'heech1013',
      pass: 'gml3413@@',
      dbname: 'nodejs'
    }, (error) => {
      if (error) {
        console.log('몽고디비 연결 에러', error);
      } else {
        console.log('몽고디비 연결 성공');
      }
    });
  };
  connect();
  // 위의 코드만으로 연결은 되지만, DB 연결이 끊겼을 때 알아서 다시 연결이 되도록 하기 위해 이벤트를 정의한다.
  mongoose.connection.on('error', (error) => {
    console.error('몽고디비 연결 에러', error);
  });
  mongoose.connection.on('disconnected', (error) => {
    console.error('몽고디비 연결이 끊겼습니다. 연결을 재시도합니다.');
    connect();
  });
  // 연결 후 몽구스 스키마들을 불러온다.
  require('./user');
  require('./comment');
};