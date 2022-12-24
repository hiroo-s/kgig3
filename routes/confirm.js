var express = require('express');
var router = express.Router();
const db = require("./db.js");

router.get('/', async function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    let user = req.session.user;
    if (!user) {
        res.status(400).send('Invalid access');
        return;
    }

    await db.setReceivedDate(user.uuid);

    res.send('OK');
});

module.exports = router;