var express = require('express');
var router = express.Router();
var db = require('./db');

router.get('/:uuid', async function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    if (!req.params.uuid) {
        res.status(400).send('Invalid access');
        return;
    }

    let user = await db.findByUuid(req.params.uuid);
    if (!user) {
        res.status(400).send('Invalid access');
        return;
    }

    // /chk で使う
    req.session.uuid = req.params.uuid;
    req.session.oldVcid = user.vcid;

    // /issue と /complete で使う
    delete req.app.locals.request[req.params.uuid];

    res.render('ticket');
});

router.post('/:uuid', async function (req, res, next) {
});


module.exports = router;
