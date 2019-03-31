// socket.io 버전. ws버전과 구조/작동원리는 거의 비슷하다. ws에서 클라이언트 간 ip 구분 및 채팅서버를 미리 구현해놓은 것이 socket.io
const SocketIO = require('socket.io');
const axios = require('axios');

module.exports = (server, app, sessionMiddleware) => {  // server: express서버
  const io = SocketIO(server, { path: '/socket.io' });  // 클라이언트에서 path(/socket.io)로 접근하면 연결 시도.
  app.set('io', io);  // ***익스프레스 변수 저장 방법! 라우터에서 변수 io를 사용할 수 있다: req.app.get('io').of('/room').emit~과 같이 메시지를 보낼 수 있음(routes/index.js)

  // ***네임스페이스: 실시간 데이터가 전달될 주소를 구별할 수 있다. 불필요한 실시간 정보 교환을 방지할 수 있다. 기본값: io.of('/')
  const room = io.of('/room');  // 채팅방 목록에 관한 실시간 이벤트만 받는 네임스페이스.
  const chat = io.of('/chat');  // 채팅에 대해서만 실시간 이벤트를 받는 네임스페이스
  io.use((socket, next) => {  // ***socket.io에서 미들웨어를 사용하는 방법(socket.io에서 익스프레스 세션을 사용하는 방법). use와 함께 (socket, next)를 넣어준다. (req, res, next)는 함수 안에 넣어준다.
    sessionMiddleware(socket.request, socket.request.res, next);  // socket.request:요청 / socket.request.res:응답
  });

  room.on('connection', (socket) => {
    console.log('room 네임스페이스에 접속');
    socket.on('disconnect', () => {
      console.log('room 네임스페이스 접속 해제');
    });
  });

  chat.on('connection', (socket) => {
    console.log('chat 네임스페이스에 접속');
    const req = socket.request;  // 요청에 대한 정보는 socket.request에 들어있다.
    const { headers: { referer } } = req;  // req.headers.referer에 웹 주소가 들어있다. (room/<방이름>)
    const roomId = referer  // room/<방이름> 중에서 <방이름> 부분만 뗴어내는 과정.
      .split('/')[referer.split('/').length - 1]
      .replace(/\?.+/,'');
    socket.join(roomId);  // ***socket.io 기본 함수: 방에 접속
    socket.to(roomId).emit('join', {  // ***socket.emit: 모든 곳에 메시지를 보낸다 / socket.to(방아이디).emit: 해당 방에만 메시지를 보낸다. nodejs 채팅방에서 보낸 메시지는 nodejs 채팅방에만 보내져야 하므로.
      user: 'system',
      chat: `${req.session.color}님이 입장하셨습니다.`,
      number: socket.adapter.rooms[roomId].length,
    });

    socket.on('disconnect', () => {
      console.log('chat 네임스페이스 접속 해제');
      socket.leave(roomId);  // ***socket.io 기본함수: 방 나가기
      // 방에 인원이 한 명도 없으면 방을 없앤다.
      const currentRoom = socket.adapter.rooms[roomId];  // socket.adapter.rooms[방아이디]: 방 정보와 인원이 들어있다.
      const userCount = currentRoom ? currentRoom.length : 0;
      if (userCount === 0) {
        // 여기서는 db 조작하지 말고, 라우터를 통해 db를 조작해라(routes/index.js: router.delete(..)). 매우 지저분해짐. 
        axios.delete(`http://localhost:8005/room/${roomId}`)
          .then(()=> {
            console.log('방 제거 요청 성공');
          })
          .catch((error) => {
            console.log(error);
            next(error);
          });
      } else {  // 방에 인원이 남아있을 경우: 방에서 누군가가 퇴장하면 알려준다.
        socket.to(roomId).emit('exit', {
          user: 'system',
          chat: `${req.session.color}님이 퇴장하셨습니다.`,
          number: socket.adapter.rooms[roomId].length,
        });
      }
    })
  });
};