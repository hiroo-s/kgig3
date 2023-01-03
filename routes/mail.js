var express = require('express');
var fetch = require('node-fetch');
var router = express.Router();
var db = require('./db');

const RECAPTCHA_API_URL = 'https://www.google.com/recaptcha/api/siteverify';
const RECAPTCHA_SITE_SECRET = '6LcKgN0jAAAAAHkt3bSSJIxd_x4lHzEG6mQYzfpo';

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

    if (!recaptchav3(req)) {
        req.session.username = 'reCAPTCHAエラー';
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

async function recaptchav3(req) {
    let token = req.body['token'];
    let option = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            secret: RECAPTCHA_SITE_SECRET,
            response: token
        })
    };

    let res = await fetch(RECAPTCHA_API_URL, option);
    let json = await res.json();

    let log = [req.body['email'], json];
    req.app.locals.captcha.push(log);
    let len = req.app.locals.captcha.length;
    if (len > 10) {
        req.app.locals.captcha.splice(0, len - 10);
    }

    if ('success' in json) {
        return json.score > 0.5;
    } else {
        return false;
    }
}


module.exports = router;
