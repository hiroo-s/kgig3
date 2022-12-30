var express = require('express');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');
let didJWT = require('did-jwt');
let conf = require('./const.js');
const db = require("./db.js");

router.get('/:uuid/:band', async function (req, res, next) {
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
    let jtiUUID = uuidv4();
    let stateUUID = uuidv4();
    let vpUUID = uuidv4();
    let nonce = Buffer.from(Array(16).fill(0).map(x => Math.floor(Math.random() * 255))).toString('base64');
    let nonce2 = Buffer.from(Array(16).fill(0).map(x => Math.floor(Math.random() * 255))).toString('base64');
    let vcName = 'Kgig3';

    const vcTitle = {
        Kgig3: {
            clientName: 'ドリンクチケット',
            schemaUri: conf.domain + 'Kgig3Credential'
        }
    }

    hint = {
        sub: uuidv4(),
        aud: conf.domain + "issue/" + req.params.uuid,
        nonce: nonce2,  //"VRTwt0xBy/O/MPl3WpKp/g==",
        "sub_jwk": {
          "crv": "secp256k1",
          "kid": conf.did + '#auth-key', //"did:web:awesome-issuer.azurewebsites.net#a6994d29ce6949a1a7f2f166d6ee2fabvcSigningKey-70889",
          "kty": "EC",
          "x": "FiJESp6bOBfENS162QHbvsuLIvynPzY-wTGQPa947Uc",
          "y": "56NawDWUfqSZNSk9pJCkcpEdx0wDBQfBDa_Sb4JZHyg"
        },
        "did": conf.did, //"did:web:awesome-issuer.azurewebsites.net",
        "name": "KAMATA GIG III",
        "startDate": "2023/2/11",
        "doorTime": "17:30",
        "startTime": "18:00",
        "performer": conf.performer[user.band],
        "location": "ニューエイト 東京都大田区蒲田5-44-14 蒲田佐藤ビルB1",
        "url": "http://neweight.tokyo/",
        "email": user.username,
        "iss": "https://self-issued.me",
        "iat": now,
        "jti": jtiUUID, //"6c7ef074-9fc9-454a-a106-1f14b8c2d935",
        "exp": now + 300
    }

    let hintJwt = await didJWT.createJWT(
        hint,
        { issuer: conf.did, signer: conf.signer },
        { alg: 'ES256K', kid: conf.did + '#auth-key' }
    )

    let payload = {
        jti: jtiUUID,
        iat: now,
        response_type: "id_token",
        response_mode: "post",
        scope: "openid",
        nonce: nonce,
        client_id: conf.did,
        redirect_uri: conf.domain + "complete/" + req.params.uuid,
        prompt: "create",
        state: stateUUID,
        exp: now + 3000,
        registration: {
            client_name: vcTitle[vcName].clientName,
            subject_syntax_types_supported: [
                "did:ion"
            ],
            vp_formats: {
                jwt_vp: {
                    alg: [
                        "ES256K"
                    ]
                },
                jwt_vc: {
                    alg: [
                        "ES256K"
                    ]
                }
            }
        },
        claims: {
            vp_token: {
                presentation_definition: {
                    id: vpUUID,
                    input_descriptors: [
                        {
                            id: vcTitle[vcName].schemaUri,
                            schema: [
                                {
                                    uri: vcTitle[vcName].schemaUri
                                }
                            ],
                            issuance: [
                                {
                                    manifest: conf.domain + "manifest/" + req.params.uuid
                                }
                            ]
                        }
                    ]
                }
            }
        },
        id_token_hint: hintJwt
    }

    let jwt = await didJWT.createJWT(
        payload,
        { issuer: conf.did, signer: conf.signer },
        { alg: 'ES256K', kid: conf.did + '#auth-key' }
    )

    await db.setBand(req.params.uuid, req.params.band);

    res.set('Content-Type', 'application/jwt');
    res.send(jwt);
});

module.exports = router;
