var express = require('express');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');
const didJWT = require('did-jwt');
const resolver = require('did-resolver');
const ION = require('@decentralized-identity/ion-tools');
const webResolver = require('web-did-resolver')
const conf = require('./const.js');
const db = require("./db.js");

router.get('/', function (req, res, next) {
    let uuid = uuidv4();
    req.session.uuid = uuid;

    res.render('verify', { uuid: uuid, domain: conf.domain });
});

router.post('/:uuid', async function (req, res, next) {
    let vpToken = req.body.vp_token;
    let uuid = req.params.uuid;

    let vvp = await didJWT.verifyJWT(vpToken, {
        audience: conf.did,
        resolver: new resolver.Resolver({ 'ion': ION.resolve })
    });
    let vc = vvp.payload.vp.verifiableCredential;

    let vvc = await didJWT.verifyJWT(vc[0], {
        resolver: new resolver.Resolver({ 'ion': ION.resolve, ...webResolver.getResolver() }),
        skewTime: 100 * 365 * 24 * 60 * 60  // 有効期限切れは後で判断する
    });

    // レスポンス
    res.set('Content-Type', 'text/plain');

    // vcid からアカウントを得る
    let vcid = vvc.payload.vc.credentialStatus.id;
    let user = await db.findByVcid(vcid);

    // VC が最新ではない、有効期限が切れてればエラー
    let now = new Date();
    let ts = new Date(vvc.payload.exp * 1000);
    if (!user || ts < now) {
        req.app.locals.request[uuid] = { error : !user ? 'no vcid' : 'expire' };
        res.send('OK');
        return;
    }

    // 受付番号確定
    await db.setSeqNum(user.uuid);

    // chk に伝える
    user = await db.findByUuid(user.uuid);
    req.app.locals.request[uuid] = user;

    res.send('OK');
});


module.exports = router;
