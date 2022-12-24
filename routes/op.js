var express = require('express');
var router = express.Router();
const db = require("./db.js");

router.get('/', async function (req, res, next) {
    res.render('op');
});

router.get('/list', async function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    let all = await db.findAll();
    res.send(JSON.stringify(all));
});

module.exports = router;