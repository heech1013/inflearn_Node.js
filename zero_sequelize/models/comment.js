module.exports = (sequelize, DataTypes) => {
    return sequelize.define('comment', {  // comment라는 테이블이 만들어진다.
        // user와 comment는 일대다 관계이다. commenter 컬럼을 따로 작성하지 않고 index.js에서 관계를 설정한다.
        comment: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize.literal('now()')  // 데이터가 생성된 날짜, 시간을 알아서 넣어준다.
        }
    }, {
        timestamp: false,
        underscored: true
    });
};

// comment 테이블
// 작성자, 댓글 내용, 생성일
// 1(zero), 안녕하세요, 2018-08-25
// 2(nero), 으하하하, 2018-07-26