var express = require('express');
var fetch = require('node-fetch');
var sgMail = require('@sendgrid/mail');
var router = express.Router();
var db = require('./db');

const RECAPTCHA_API_URL = 'https://www.google.com/recaptcha/api/siteverify';
const RECAPTCHA_SITE_SECRET = '6LcKgN0jAAAAAHkt3bSSJIxd_x4lHzEG6mQYzfpo';

const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

    // メール送信
    if (!req.body['forTest']) {
        sendmail(req, username, url);
    }

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

function sendmail(req, username, url) {
    function mailLog(log) {
        req.app.locals.maillog.push(log);
        let len = req.app.locals.maillog.length;
        if (len > 10) {
            req.app.locals.maillog.splice(0, len - 10);
        }
    }

    let msg = {
        to: username,
        from: 'did-wg@iij.ad.jp',
        subject: 'KGIG III ドリンクチケット ダウンロード',
        text: "このメールに返信しないでください。\r\n\r\n" +
            "こちらのURLにアクセスしてデジタルチケットをダウンロードしてください。\r\n" + url
    };
    sgMail.send(msg).then(() => {
        mailLog([username, new Date()]);
    }).catch((error) => {
        mailLog([username, new Date(), error]);
    });
}

module.exports = router;
