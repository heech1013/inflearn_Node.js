const path = require('path');
const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';  // 개발용이기 때문에 'development'로 하고 넘어간다. 실제 배포 시 'production'으로 해주고, 여러 환경변수 설정을 해주어야 한다.
const config = require('../config/config.json')[env];  // sequelize 패키지의 설정들을 불러온다. config.json의 development 객체가 불러와진다.

const sequelize = new Sequelize(config.database, config.username, config.password, config);  // sequelize 패키지를 설정을 넣어서 인스턴스화한다.

const db = {};

db.Sequelize = Sequelize;  // Sequelize 패키지를 넣는다
db.sequelize = sequelize;  // sequelize 인스턴스를 넣는다.

db.User = require('./user')(sequelize, Sequelize);  // (sequelize, Sequelize): use.js의 module의 매개변수로 들어간다.
db.Comment = require('./comment')(sequelize, Sequelize);
// user와 comment는 일대다 관계이다. 테이블 간의 관계 설정.
db.User.hasMany(db.Comment, { foreignKey: 'commenter', sourceKey: 'id' });  // 관계 설정. comment.js에 있었어야 할 commenter 컬럼을 이곳에 추가한다. id를 통해 참조, 연결된다.
db.Comment.belongsTo(db.User, { foreignKey: 'commenter', targetKey: 'id' });

module.exports = db;

/*
1대1: hasOne, belongsTo
1대다: hasMany, belongTo
다대다: belongsToMany, belongsToMany
*/