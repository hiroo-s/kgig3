const express = require('express');
const fetch = require('node-fetch');
const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const router = express.Router();
const db = require('./db');

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
    };

    const porter = nodemailer.createTransport({
        service: 'Gmail',
        port: 465,
        secure: true,
        auth: {
            user: 'kamatagig2023@gmail.com',
            pass: process.env.GMAIL_API_KEY
        }
    });

    porter.sendMail({
        from: 'KAMATA GIG III <kamatagig2023@gmail.com>',
        to: username,
        subject: 'KAMATA GIG III デジタルチケット申込み受付',
        text: "KAMATA GIG III デジタルチケット申込みいただきありがとうございます。\r\n" +
            "デジタルチケット申込みの心当たりのない方はお手数ですが削除ください。\r\n\r\n" + 
            "以下のリンクからデジタルチケットをスマホにダウンロードし、当日会場で提示ください。\r\n" + 
            url + 
            "\r\n\r\n" +
            "◇ デジタルチケットのダウンロード手順：\r\n" +
            " 1. 事前にMicrosoft Authenticator をスマホにインストール\r\n" +
            " 2. 上記リンクからアクセスするページにて、知り合いの「出演者」を選択して\r\n" +
            "    「デジタルチケットダウンロード」ボタンをクリックするとQRコードが表示\r\n" +
            " 3. Authenticatorアプリを起動\r\n" +
            " 4. アプリの右下メニューの「検証済みID」をタップ\r\n" +
            " 5. アプリの右上メニューのアイコンをタップしてカメラを起動\r\n" +
            " 6. 2. で表示されたQRコードを 5. で起動したカメラで読み込み\r\n" +
            " 7. デジタルチケットがダウンロードされるので「追加」ボタンで保存\r\n\r\n" +
            "1. の Authenticator インストール後、スマホメーラから上記 2. の操作を行うと 7. \r\nまでは自動で遷移します。（推奨）\r\n" +
            "ただし、スマホのメーラが Outlook アプリの場合、リンクにアクセスしても組込ブラウザ\r\n" +
            "が Authenticator 連携対応していないため、リンクを他のブラウザにコピペしてアクセス\r\nをしてください。\r\n\r\n" +
            "お問合せ先メールアドレス： kamatagig2023@gmail.com\r\n\r\n"
    }, function (err, info) {
        if (err) { // エラーの場合 --- (*8)
            mailLog([username, new Date(), info, err]);
            return
        }
        // 正しく送信できた場合 --- (*9)
        mailLog([username, new Date(), info]);
    })
}

function sendmail_sendgrid(req, username, url) {
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
