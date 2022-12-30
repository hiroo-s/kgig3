var express = require('express');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');
const didJWT = require('did-jwt');
const resolver = require('did-resolver');
const ION = require('@decentralized-identity/ion-tools');
const conf = require('./const.js');
const db = require('./db.js');

router.post('/:uuid', async function (req, res, next) {
    if (!req.params.uuid) {
        res.status(400).send('Invalid access');
        return;
    }
    let user = await db.findByUuid(req.params.uuid);
    if (!user) {
        res.status(400).send('Invalid access');
        return;
    }

    let now = Math.floor(new Date().getTime() / 1000);
    let uuid = req.params.uuid;
    let stateUUID = uuidv4();
    let vcUUID = uuidv4();
    let nonce = Buffer.from(Array(16).fill(0).map(x => Math.floor(Math.random() * 255))).toString('base64');
    let vcName = 'Kgig3';

    const vcTitle = {
        Kgig3: {
            exp: now + 30 * 24 * 60 * 60,
            schemaUri: conf.domain + 'Kgig3Credential',
            vcSubject: {
                "http://schema.org/name": "KAMATA GIG III",
                "http://schema.org/startDate": "2023/2/11",
                "http://schema.org/doorTime": "17:30",
                "http://schema.org/startTime": "18:00",
                "http://schema.org/performer": conf.performer[user.band],
                "http://schema.org/location": "ニューエイト 東京都大田区蒲田5-44-14 蒲田佐藤ビルB1",
                "http://schema.org/url": "http://neweight.tokyo/",
                "http://schema.org/email": user.username
            }
        }
    };

    const walletToken = await didJWT.verifyJWT(req.body, {
        audience: conf.domain + "issue/" + uuid,
        resolver: new resolver.Resolver({ 'ion': ION.resolve })
    });
    const walletDID = walletToken.issuer;
    let payload = {
        "vc": {
            "@context": [
                "https://www.w3.org/2018/credentials/v1"
            ],
            type: [
                "VerifiableCredential",
                vcTitle[vcName].schemaUri
            ],
            credentialSubject: vcTitle[vcName].vcSubject,
            credentialStatus: {
                "id": "urn:uuid:" + vcUUID,
                "type": "RevocationList2021Status",
                "statusListIndex": 1
            }
        },
        "jti": "urn:pic:" + uuidv4(),
        "iss": conf.did,
        "sub": walletDID,
        "iat": now,
        "exp": vcTitle[vcName].exp
    }
    let jwt = await didJWT.createJWT(
        payload,
        { issuer: conf.did, signer: conf.signer },
        { alg: 'ES256K', kid: conf.did + '#auth-key' }
    )

    res.set('Content-Type', 'application/json');
    res.send('{"vc":"' + jwt + '"}');

    // /complete で使う
    req.app.locals.request[uuid] = {
        vcid: payload.vc.credentialStatus.id
    };
});

module.exports = router;
