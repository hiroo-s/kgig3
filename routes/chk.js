var express = require('express');
var router = express.Router();
const db = require("./db.js");

router.get('/', async function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    if (!req.session.uuid) {
        res.send('NG');
        return;
    }

    // VP のチェック
    if (req.app.locals.request[req.session.uuid]) {
        // /verified で用いる
        req.session.user = req.app.locals.request[req.session.uuid];
        delete req.app.locals.request[req.session.uuid];
        if (req.session.user.error) {
            res.send(req.session.user.error);
        } else {
            res.send('OK');
        }
        return;
    }

    let user = await db.findByUuid(req.session.uuid);
    if (!user) {
        res.send('NG');
        return;
    }

    // デジタルチケットがダウンロードされたら vcId が更新される
    if (req.session.oldVcid == user.vcid) {
        res.send('NG');
        return;
    }

    res.send('OK');
});

router.get('/locals', function (req, res, next) {
    res.send(
        JSON.stringify(req.app.locals.request) + ' ' +
        JSON.stringify(req.session.user));
});

router.get('/captcha', function (req, res, next) {
    res.send(
        JSON.stringify(req.app.locals.captcha)
    );
});


module.exports = router;
