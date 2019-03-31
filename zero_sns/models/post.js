module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('post', {
    content: {
      type: DataTypes.STRING(140),
      allowNull: false
    },
    img: {  // 이미지 원본은 서버에 저장, 주소를 DB에 저장
      type: DataTypes.STRING(200),
      allowNull: true
    }
  }, {
    timestamps: true,
    paranoid: true,
    charset: 'utf8',  // mySQL에서 한글이 깨질 때. 클라우드 서비스의 경우 설정이 영어로 되어있는 경우가 있어 추가로 설정을 해주어야 한다.
    collate: 'utf8_general_ci',  // 위 설명과 같다.
  })

  return Post;
};