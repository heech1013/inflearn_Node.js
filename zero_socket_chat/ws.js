// ws 모듈 사용법 - 기본적인 웹소켓 핑퐁서버 구현. socket.js 파일 전 버전임

const WebSocket = require('ws');

module.exports = (server) => {
  // HTTP와 WS는 포트를 공유하기 때문에 한 번 연결하면 WS는 포트를 따로 연결할 필요가 없다.
  // http://zerocho.com/:8005 연결 시 저절로 ws://zerocho.com/:8005
  const wss = new WebSocket.Server({ server });  // 익스프레스 서버를 웹소켓 서버와 연결 (wss: web socket server)

  // 기존 HTTP통신: 클라이언드->http->서버 / 웹소켓통신: 클라이언트->ws->서버
  wss.on('connection', (ws, req) => {  // 웹소켓은 이벤트 기반으로 작동 /  웹소켓을 통해 클라이언트와 서버가 연결될 때(사용자가 들어왔을 때) 발생하는 이벤트 connection
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;  // 사용자의 ip를 알아내는 법. <프록시 서버 거치기 전 ip> 또는 <최종 ip>. 중간에 프록시 서버를 거칠 경우를 대비하여.
    console.log('클라이언트 접속',ip);
    ws.on('message', (message) => {  // 사용자가 메시지를 보냈을 때 발생하는 이벤트(클라이언트에서 서버로)
      console.log(message);
    });
    ws.on('error', (error) => {  // 오류가 났을 때 발생하는 이벤트
      console.log(error);
    });
    ws.on('close', () => {  // 사용자가 종료했을 때 발생하는 이벤트
      console.log('클라이언트 접속 해제', ip);
      clearInterval(ws.Interval);  // 클라이언트가 종료한 후에도 계속 setInterval이 시행되기 때문에 적절한 시점에 clearInterval을 작동시켜주지 않으면 메모리 누수가 발생한다.
    });
    const interval = setInterval(() => {  // setInterval(): 주기적으로(3초) 함수 실행
      if (ws.readyState === ws.OPEN) {  // readyState: 웹소켓 연결 상태. ws.OPEN(연결 수립)인 상태여야 메시지를 보낼 수 있다. 나머지 ws.CONNECTING(연결 중), ws.CLOSING(종료 중), ws.CLOESED(종료)일 때는 메시지를 보낼 수 없다.
        ws.send('서버에서 클라이언트로 메시지를 보냅니다.');  // 서버에서 클라이언트로 메시지를 보내는 방법
      }
    }, 3000);
    ws.interval = interval;  // 종료시 interval 함수를 종료하기 위함
  })
};