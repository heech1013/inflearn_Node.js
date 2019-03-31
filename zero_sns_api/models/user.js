module.exports = (sequelize, DataTypes) => {
  // 모델을 따로 User 변수에 할당한 후에야 index.js 파일에서 User를 sequelize.model로 인식했다. 왜인지는 모르겠다.
  const User = sequelize.define('user', {
    email: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true
    },
    nick: {
      type: DataTypes.STRING(15),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: true  // 카카오 로그인 시 비밀번호 없이 로그인 가능
    },
    provider: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'local'
    },  // 카카오, local 구분
    snsId: {
      type: DataTypes.STRING(30),
      allowNull: true  // 카카오 로그인 시에만 알려줌
    }
  }, {
    timestamps: true,  // 생성일, 수정일 기록
    paranoid: true  // 삭제된 테이블 row 복구에 용이(사용자 계정 복구 등). 데이터 삭제 시 데이터 자체를 삭제하는 것이 아니라 삭제일을 기록해놓는다. 삭제일이 기록되어 있으면 삭제된 것으로 판별
  })
  return User;
};