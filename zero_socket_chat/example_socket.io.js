io.on('connection', (socket) => {  // 클라이언트 접속 시 연결 이벤트 발생
  const req = socket.request;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;  // 프록시 서버 ip 또는 최종 ip
  console.log('새로운 클라이언트 접속!', ip, socket.id, req.ip);  // socket.io로 클라이언트를 구분할 수 있다.
  socket.on('disconnect', () => {  // 클라이언트와 연결이 끊어졌을 때 이벤트 발생(기본 이벤트)
    console.log('클라이언트 접속 해제', ip, socket.id);
    clearInterval(socket.interval);  // 사용자 접속 종료 시 setInterval 종료(메모리 누수 방지)
  });
  socket.on('error', (error) => {  // 에러 발생 시 이벤트 발생(기본 이벤트)
    console.error(error);
  });
  socket.on('reply', (data) => {  // 사용자가 메시지를 보냈을 때 이벤트 발생(클라이언트->서버). (사용자 정의 이벤트)
    console.log(data);
  });
  socket.interval = setInteval(() => {  // 3초마다 함수 실행
    socket.emit('news', 'Hello Socket.IO');  // emit('키', '값'): 서버에서 클라이언트로 키-값 형태로 메시지를 보낸다.
  }, 3000);
})