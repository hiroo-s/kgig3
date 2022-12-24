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
    if (! await db.findByUuid(req.params.uuid)) {
        res.status(400).send('Invalid access');
        return;
    }

    let now = Math.floor(new Date().getTime() / 1000);
    let jtiUUID = uuidv4();
    let stateUUID = uuidv4();
    let vpUUID = uuidv4();
    let nonce = Buffer.from(Array(16).fill(0).map(x => Math.floor(Math.random() * 255))).toString('base64');
    let vcName = 'Kgig3';

    const vcTitle = {
        Kgig3: {
            clientName: 'ドリンクチケット',
            schemaUri: conf.domain + 'Kgig3Credential'
        }
    }

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
        }
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
