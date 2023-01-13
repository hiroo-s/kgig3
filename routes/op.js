var express = require('express');
var basicAuth = require('basic-auth-connect');
var router = express.Router();
const db = require("./db.js");

router.get('/', async function (req, res, next) {
    let auth = basicAuth('admin', 'kgig3');
    auth(req, res, function () {});

    if (!req.user) {
	return;
    }

    req.session.auth = req.user;

    res.render('op');
});

router.get('/list', async function (req, res, next) {
    if (!req.session.auth) {
        res.status(401);
        res.send('{}');
        return;
    }

    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    let all = await db.findAll();
    res.send(JSON.stringify(all));
});


module.exports = router;
