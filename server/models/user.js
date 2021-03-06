'use strict';
const confirToken = require('../tools/confirToken');
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id            : {
            type         : DataTypes.INTEGER,
            primaryKey   : true,
            autoIncrement: true
        },
        username      : {
            type: DataTypes.STRING
        },
        email         : {
            type: DataTypes.STRING
        },
        phone         : {
            type: DataTypes.STRING
        },
        password      : {
            type: DataTypes.STRING
        },
        avatar        : {
            type        : DataTypes.STRING,
            defaultValue: 'https://my-blog.pek3b.qingstor.com/default.jpg'
        },
        gitHubId      : {
            type        : DataTypes.INTEGER,
            defaultValue: null
        },
        changePassword: {
            type        : DataTypes.BOOLEAN,
            defaultValue: 0
        },
        admin         : {
            type        : DataTypes.BOOLEAN,
            defaultValue: 0
        }
    }, {
        freezeTableName: true,
        timestamps     : true, // 时间戳属性 (updatedAt, createdAt)
        createdAt      : 'CreatedAt',
        updatedAt      : 'UpdatedAt'
    });

    User.associate = function (models) {
        models.User.hasMany(models.Post);
        models.User.hasMany(models.Comment);
        models.User.hasMany(models.Reply);
        models.User.hasMany(models.P_like);
        models.User.hasMany(models.User_Follow, {
            foreignKey: 'follow_id'
        });
        models.User.hasMany(models.P_message, {
            as        : 'send',
            foreignKey: 'send_id'
        });
    };

    return User;
};

