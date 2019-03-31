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
    paranoid: true
  })

  return Post;
};