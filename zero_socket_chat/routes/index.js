const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const Room = require('../schemas/room');
const Chat = require('../schemas/chat');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const rooms = await Room.find({});
    res.render('main', {
      rooms,
      title: 'GIF 채팅방',
      error: req.flash('roomError'),
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/room', (req, res) => {
  res.render('room', { title: 'GIF 채팅방 생성' });
});

router.post('/room', async (req, res, next) => {
  try {
    const room = new Room({
      title: req.body.title,
      max: req.body.max,
      owner: req.session.color,
      password: req.body.password,
    });
    const newRoom = await room.save();  // 새로운 방 생성
    const io = req.app.get('io');  // app.set('io', io)을 통해 io를 변수로 사용할 수 있다(socket.js)
    io.of('/room').emit('newRoom', newRoom);  // 새로운 방이 생성되었음을 알림
    res.redirect(`/room/${newRoom._id}?password=${req.body.password}`);  // 새로운 방으로 redirect. 방의 아이디와 비밀번호를 쿼리스트링 형태로 전달
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/room/:id', async (req, res, next) => {
  try {
    const room = await Room.findOne({ _id: req.params.id });
    const io = req.app.get('io');
    if(!room) {
      req.flash('roomError', '존재하지 않는 방입니다.');
      return res.redirect('/');
    }
    if (room.password && room.password !== req.query.password) {
      req.flash('roomError', '비밀번호가 틀렸습니다.');
      return releaseEvents.redirect('/');
    }
    const { rooms } = io.of('/chat').adapter;  // adapter.rooms 안에 현재 방 정보가 있다.
    if (rooms && rooms[req.params.id] && room.max <= rooms[req.params.id].length) {  // 방 정원을 초과했을 때. 현재 방 인원: adapter.rooms[방 번호].length
      req.flash('roomError', '허용 인원 초과');
      return res.redirect('/');
    }
    const chats = await Chat.find({ room: room._id }).sort('createdAt');  // 이전 채팅 내용
    return res.render('chat', {
      room,
      title: room.title,
      chats,
      number: (rooms && rooms[req.params.id] && rooms[req.params.id].length + 1) || 1,
      user: req.session.color,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/room/:id', async (req, res, next) => {  // 채팅방의 모든 사람이 나갔을 때 방과 채팅내용을 지운다.
  try {
    await Room.remove({ _id: req.params.id });
    await Chat.remove({ room: req.params.id });
    res.send('ok');
    setTimeout(() => {
      req.app.get('io').of('/room').emit('removeRoom', req.params.id);
    }, 2000);  // 모든 사람에게 실시간으로 방이 지워졌음을 알림. 방 목록이 실시간으로 지워진다.
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/room/:id/chat', async (req, res, next) => {  // chat.pug에서 채팅 내역을 xhr.open('POST', ...)의 형식으로 요청한다. 이유는 지저분하기 때문에 디비조작을 라우터에서 태우기 위함.
  try {
    const chat = new Chat({
      room: req.params.id,
      user: req.session.color,
      chat: req.body.chat,
    });
    await chat.save();
    req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);  // chat.pug에서 socket.on('chat', ...)으로 받는다.
  } catch (error){
    console.error(error);
    next(error);
  }
});

fs.readdir('uploads', (error) => {  // uploads 폴더가 없으면 폴더를 생성한다.
  if (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
  }
});
const upload = multer({  // multer 설정
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },  // 용량 제한. 10메가바이트
});

router.post('/room/:id/gif', upload.single('gif'), async (req, res, next) => {
  try {
    const chat = new Chat({
      room: req.params.id,
      user: req.session.color,
      gif: req.file.filename,
    });
    await chat.save();
    res.send('ok');
    req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);  // chat.pug의 socket.on('chat', ...)에 대응
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;