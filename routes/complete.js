var express = require('express');
var router = express.Router();
const db = require("./db.js");

router.post('/:uuid', async function (req, res, next) {
    if (!req.params.uuid) {
        res.status(400).send('Invalid access');
        return;
    }

    let user = await db.findByUuid(req.params.uuid);
    if (!user){
        res.status(400).send('Invalid access');
        return;
    }

    // POST data のチェックは省略
    // let data = req.body;

    res.set('Content-Type', 'text/plain');
    res.send('Accepted');
});

module.exports = router;
