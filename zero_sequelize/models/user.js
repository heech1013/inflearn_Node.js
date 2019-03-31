module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user', {  // user라는 테이블이 만들어진다.
        name: {
            type: DataTypes.STRING(20),  // Sequelize.STRING(20)
            allowNull: false,
            unique: true
        },
        age: {
            type: DataTypes.INTEGER.UNSIGNED,  // 음수가 없으므로
            allowNull: false
        },
        married: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: sequelize.literal('now()')  // 데이터가 생성된 날짜, 시간을 알아서 넣어준다.
        }
    }, {  // 옵션
        timestamp: false,  // sequelize가 생성일을 따로 기록해주는 것. 따로 생성해서 받으니 false로 해놓은 것.
        underscored: true  // snake case(_)를 사용하는 것을 권장. true일 때 cammal case(-) 사용하는 것을 권장.
    });
};

// users 테이블
// (아아디), 이름, 나이, 결혼여부, 자기소개, 생성일
// (1), zero, 23, false, 안녕하세요, 2018-07-25
// (2), nero, 32, true, 나는 폭군이다, 2018-07-26