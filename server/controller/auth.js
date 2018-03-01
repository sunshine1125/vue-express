const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const apiRoutes = express.Router();
const User = require('../models/user');
let config = process.env.NODE_ENV === 'development' ? require('../config/prod') : require('../config/dev')
console.log(config);

app.set('superSecret', config().databaseConnect().secret);// secret variable
apiRoutes.post('/register', (req, res) => {
    let newUser = new User({
        username          : req.body.username,
        password          : req.body.password,
        email             : req.body.email,
        confirmation_token: config().getconfirToken(),
        changePassword    : false,
        admin             : true
    });
    User.findOne({
        email: req.body.email
    }, function (err, user) {
        if (user) {
            res.json({success: false, message: '该邮箱已经注册，请直接登录！'})
        } else {
            newUser.save((err, data) => {
                if (err) {
                    res.status('405').json({code: 405, msg: err})
                } else {
                    return res.json({
                        success: true,
                        message: '注册成功',
                    })
                }
            })
        }
    });

});

apiRoutes.post('/sendEmail', (req, res) => {
    let options = {
        from   : '"测试" <371262808@qq.com>',
        to     : '"测试"' + req.body.email,
        subject: '一封来自sunshine1125的邮件',
        text   : '一封来自sunshine1125的邮件',
        html   : `<h1>你好，欢迎加入我们！</h1>
                  <p>请点击下面的按钮激活你的账户</p>
                  <a href="http://localhost:3000/checkActive/?email=${req.body.email}">点击激活账号</a>`
    };

    let mailTransport = config().emailConfig();
    mailTransport.sendMail(options, (err, msg) => {
        if (err) {
            console.log(err);
            res.json({success: false, message: '发送失败！'})
        } else {
            console.log(msg);
            res.json({success: true, message: '发送成功！'})
        }
    })
});

apiRoutes.post('/forgotPassword', (req, res) => {
    let options = {
        from   : '"测试" <371262808@qq.com>',
        to     : '"测试"' + req.body.email,
        subject: '一封来自sunshine1125的邮件',
        text   : '一封来自sunshine1125的邮件',
        html   : `<h1>修改密码</h1>
                  <p>确认修改密码吗？</p>
                  <a href="http://localhost:3000/checkPassword/?email=${req.body.email}">修改密码</a>`
    };

    let mailTransport = config().emailConfig();
    mailTransport.sendMail(options, (err, msg) => {
        if (err) {
            console.log(err);
            res.json({success: false, message: '发送失败！'});
        } else {
            console.log(msg);
            res.json({success: true, message: '发送成功！'});
        }
    })
});

apiRoutes.get('/checkActive', (req, res) => {
    User.update({email: req.query.email}, {confirmation_token: null}, (err, doc) => {
        if (err) {
            res.send(err);
        } else {
            res.redirect(config().urlConfig().login)
        }
    })
});

apiRoutes.get('/checkPassword', (req, res) => {
    User.update({email: req.query.email}, {changePassword: true}, (err, doc) => {
        if (err) {
            res.send(err);
        } else {
            res.redirect(config().urlConfig().changePassword)
        }
    })
});

apiRoutes.post('/singleUser', (req, res) => {
    console.log(req.body.oldPassword)
    if (req.body.oldPassword) {
        User.findOne({email: req.body.email}, (err, user) => {
            if (user.password != req.body.oldPassword) {
                res.json({code: 401, success: false, message: '旧密码输入错误'})
            } else {
                User.update({email: req.body.email}, {password: req.body.password}, (err, docs) => {
                    if (err) {
                        console.log(err);
                    }
                    res.status('200').json({code: 200, success: true, message: '密码修改成功'})
                });
            }
        })
    }
});

apiRoutes.get('/canChangePassword/:email', (req, res) => {
    User.findOne({
        email: req.params.email
    }, function (err, user) {
        if (!user.changePassword) {
            res.json({success: false, message: '邮箱验证失败！'})
        } else {
            res.json({success: true, message: '邮箱验证成功！'})
        }
    })
});

apiRoutes.put('/canChangePassword', (req, res) => {
    User.update({email: req.body.email}, {changePassword: false}, (err, doc) => {
        if (err) {
            res.send(err);
        }
    })
});

// apiRoutes.get('/password', (req, res) => {
//     User.findOne({email: req.body.email}, (err, user) => {
//         if (user.password != req.body.oldPassword) {
//             res.status('401').json({code: 401, success: false, msg: '旧密码输入错误'})
//         } else {
//             res.
//         }
//     })
// });

apiRoutes.post('/authentication', (req, res) => {
    User.findOne({
        email: req.body.username
    }, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.json({success: false, check: true, message: '验证失败，没有找到用户！'})
        } else if (user) {
            if (user.password != req.body.password) {
                res.json({success: false, check: true, message: '密码输入错误'})
            } else if (user.confirmation_token) {
                res.json({success: false, check: false, message: '邮箱验证失败，请重新验证！'});
            } else {
                const payload = {
                    admin: user.admin
                };

                let token = jwt.sign(payload, app.get('superSecret'), {
                    // expiresInMinutes: 1440  // expires in 24 hours
                });

                // return the information including token as JSON
                return res.json({
                    success: true,
                    message: '登录成功',
                    token  : token
                })
            }
        }
    })
});

module.exports = apiRoutes;