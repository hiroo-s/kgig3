var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    let username = req.session.username;

    res.render('index', { email: username });
});

module.exports = router;
