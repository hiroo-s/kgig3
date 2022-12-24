var express = require('express');
var router = express.Router();
let didJWT = require('did-jwt');
let conf = require('./const.js');

router.get('/did.json', function (req, res, next) {
    res.render('did');
});


router.get('/did-configuration.json', async function (req, res, next) {
    payload = {
        "sub": conf.did,
        "iss": conf.did,
        "nbf": 1661395960,
        "exp": 2450314360,
        "vc": {
            "@context": [
                "https://www.w3.org/2018/credentials/v1",
                "https://identity.foundation/.well-known/contexts/did-configuration-v0.0.jsonld"
            ],
            "issuer": conf.did,
            "issuanceDate": "2022-08-25T02:52:40.568Z",
            "expirationDate": "2047-08-25T02:52:40.568Z",
            "type": [
                "VerifiableCredential",
                "DomainLinkageCredential"
            ],
            "credentialSubject": {
                "id": conf.did,
                "origin": conf.domain
            }
        }
    };
    let now = Math.floor(new Date().getTime() / 1000);
    let fullPayload = { ...payload, iss: conf.did };
    let header = { alg: 'ES256K', kid: conf.did + '#auth-key' };
    let jwt = await didJWT.createJWS(fullPayload, conf.signer, header);
    res.set('Content-Type', 'application/json');
    res.render('did-configuration', {jwt: jwt});
});

module.exports = router;
