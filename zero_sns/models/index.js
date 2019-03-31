const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
  config.database, config.username, config.password, config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
// 모델 참조
db.User = require('./user')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);
// 일대다 관계
db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);
// 게시물과 해시태그 관계, 다대다 관계: through에 새로 생기는 모델 이름을 넣어준다(매칭 테이블 명)
db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' });
// 유저 간 팔로워-팔로잉 관계, 다대다 관계(같은 모델 간): as에 매칭 모델 이름, foreignKey에 상대 테이블 아이디를 넣어준다. 예시: A.belongsToMany(B, { as: 'B_name', foreignKey: 'A_id })
db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followers', foreignKey: 'followingId' });
db.User.belongsToMany(db.User, { through: 'Follow', as: 'Followings', foreignKey: 'followerId' });
// 게시물과 유저 간의 좋아요(다대다 관계)
db.User.belongsToMany(db.Post, { through: 'Like' });
db.Post.belongsToMany(db.User, { through: 'Like', as: 'Liker' });

/*
***다대다 관계에서는 새로운 모델(매칭 테이블)이 필요***
(Post)
1. 안녕하세요. #노드 #익스프레스
2. 안녕하세요. #노드 #제이드
3. 안녕하세요. #제이드 #퍼그
(hashtag)
1. 노드
2. 익스프레스
3. 제이드
4. 퍼그
(관계)
1-1
1-2
2-1
2-3
3-3
3-4

***같은 모델 간에도 다대다 관계 성립 가능***
(user)
1. 제로
2. 네로
3. 히어로
4. 바보
(user)
1. 제로
2. 네로
3. 히어로
4. 바보
(매칭 테이블: 팔로워-팔로잉)
1-2
1-3
2-3
3-1
1-4
*/

module.exports = db;