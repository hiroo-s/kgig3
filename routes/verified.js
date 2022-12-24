var express = require('express');
var router = express.Router();
const db = require("./db.js");

router.get('/', async function (req, res, next) {
    let uuid = req.session.uuid;
    let user = req.session.user;
    if (!uuid || !user) {
        res.redirect('/verify');
        return;
    }

    if (req.session.user.error) {
        res.render('verified-err');

    } else {
        // drink ボタンをクリックすると DB が更新されるので取り直す
        user = await db.findByUuid(user.uuid);

        res.render('verified', { user: user });
    }
});

module.exports = router;
