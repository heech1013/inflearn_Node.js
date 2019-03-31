module.exports = (sequelize, DataTypes) => {
  const Hashtag = sequelize.define('hashtag', {
    title: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true
    }
  }, {
    timestamps: true,
    paranoid: true,
    charset: 'utf8',  // mySQL에서 한글이 깨질 때. 클라우드 서비스의 경우 설정이 영어로 되어있는 경우가 있어 추가로 설정을 해주어야 한다.
    collate: 'utf8_general_ci',  // 위 설명과 같다.
  })

  return Hashtag;
};