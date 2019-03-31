const express = require('express');
const multer = require('multer');
const path = require('path');

const { Post, Hashtag, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

const upload = multer({  // 옵션
  storage: multer.diskStorage({  // 서버 디스크에 저장한다(<-> s3 등 외부 이미지 스토리지 저장)
    destination(req, file, cb) {  // 파일 경로
      cb(null, 'uploads/');  // uploads라는 폴더에 파일 저장. cb(에러, 결과값(목적지엔 목적지, 파일명엔 파일명 등등))
    },
    filename(req, file, cb) {  // 파일 명 설정 필요(확장자도 안붙여주고 지맘대로임)
      const ext = path.extname(file.originalname);  // ext: 확장자. path.extname: path 모듈 참고(확장자 뺴온다). file: 파일 정보. originalname: 파일 명. 
      cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);  // 확장자를 제외한 파일 명(basename)에 현재시간(파일명 중복 방지)과 확장자를 붙여준다.
    }
  }),
  limit: { fileSize: 5 * 1024 * 1024 }
});
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {  // single(input form의 필드명): 이미지 하나 / array(단일 필드): 이미지 여러 개 / fields(여러 필드): 이미지 여러 개 / none: 이미지x 
  console.log(req.body, req.file);  // img: req.file에 저장됨
  res.json({ url: `/img/${req.file.filename}` });  // 서버의 어느 곳에 저장되어 있는지 출력
});

const upload2 = multer();  // 게시물 작성
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {  // none: 이미지 없을 때
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      userId: req.user.id  // post를 작성한 user 정보. 일대다 관계
    });
    const hashtags = req.body.content.match(/#[^\s]*/g);  // 해시태그 내용에서 띄어쓰기를 제거하는 정규표현식.
    if (hashtags) {
      // 안녕하세요 #노드 #익스프레스
      // hashtag = ['#노드', '#익스프레스']
      const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
        where: { title: tag.slice(1).toLowerCase() }  // '#' 제거 후 모두 소문자로 변환(검색 용이성 위해)
      })));
      await post.addHashtags(result.map(r => r[0]));  // A.getB:관계있는 로우 조회 / A.addB:관계 생성 / A.setB:관계 수정 / A.removeB:관계 제거
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await Post.destroy({ where: { id: req.params.id, userId: req.user.id }});  // 내가 쓴 글인지 추가로 확인!
    res.send('OK');
  } catch (error) {
    console.error(error);
    next(error);
  }
})

router.get('/hashtag', async (req, res, next) => {
  const query = req.query.hashtag;
  if (!query) {
    return res.redirect('/');
  }
  try {
    const hashtag = await Hashtag.find({ where: { title: query }});
    let posts = [];
    if (hashtag) {
      posts = await hashtag.getPosts({ include: [{ model: User }]});  // hashtag와 관련된 post들을 가져온다. user 정보를 포함하여. / A.getB:관계있는 로우 조회 / A.addB:관계 생성 / A.setB:관계 수정 / A.removeB: 관계 제거
    }
    return res.render('main', {
      title: `${query} | NodeBird`,
      user: req.user,
      twits: posts
    })
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/:id/like', async (req, res, next) => {
  try {
    const post = await Post.find({ where: { id: req.params.id }});
    await post.addLiker(req.user.id);
    res.send('OK');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.delete('/:id/like', async (req, res, next) => {
  try {
    const post = await Post.find({ where: { id: req.params.id }});
    await post.removeLiker(req.user.id);
    res.send('OK');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;