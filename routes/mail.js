var express = require('express');
var router = express.Router();
var db = require('./db');

router.get('/', async function (req, res, next) {
    // デバッグメッセージ用
    let param = {
        username: req.session.username,
        url: req.session.url
    }
    res.render('mail', param);
});

router.post('/', async function (req, res, next) {
    let username = req.body['email'];
    if (!username || username.indexOf('@') < 0) {
        // エラー
        req.session.username = username;
        res.redirect('/');
        return;
    }

    let uuid = await db.getUuid(username);
    let url = req.protocol + '://' + req.get('host') + '/ticket/' + uuid;

    // TODO: ここでメール送信
    await db.setMailDate(uuid);

    req.session.url = url;
    req.session.username = username;

    res.redirect('/mail')
});

module.exports = router;
