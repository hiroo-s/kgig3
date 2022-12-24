var express = require('express');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');
let didJWT = require('did-jwt');
let conf = require('./const.js');
const db = require('./db.js');

router.get('/:uuid', async function (req, res, next) {
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
            title: '2023/2/11 17:30-',
            description: 'デジタルチケット （KAMATA GIG III）',
            instructions: 'デジタルチケットを保存します',
            claims: {
                "vc.credentialSubject.http://schema.org/name": {
                    type: "String",
                    label: "タイトル"
                },
                "vc.credentialSubject.http://schema.org/startDate": {
                    type: "Date",
                    label: "開催日"
                },
                "vc.credentialSubject.http://schema.org/doorTime": {
                    type: "String",
                    label: "開場"
                },
                "vc.credentialSubject.http://schema.org/startTime": {
                    type: "String",
                    label: "開演"
                },
                "vc.credentialSubject.http://schema.org/performer": {
                    type: "String",
                    label: "選択出演者"
                },
                "vc.credentialSubject.http://schema.org/location": {
                    type: "String",
                    label: "会場"
                },
                "vc.credentialSubject.http://schema.org/url": {
                    type: "String",
                    label: "会場URL"
                },
                "vc.credentialSubject.http://schema.org/email": {
                    type: "String",
                    label: "メールアドレス"
                }
            }
        }
    };

    let payload = {
        id: "NGUxY2VjZDEtYzc2Ni00NzY3LWI2MTgtZDhjNjQ1MTM2MmNmdmVyaWZpZWRjcmVkZW50aWFsZXhhbXBsZQ",
        display: {
            locale: "en-US",
            contract: conf.domain + "manifest/" + req.params.uuid,
            card: {
                title: vcTitle[vcName].title,
                issuedBy: conf.domain,
                backgroundColor: "#f02e2f",
                textColor: "#ffffff",
                logo: {
                    uri: conf.domain + "images/kamata-gig.png",
                    description: "logo"
                },
                description: vcTitle[vcName].description
            },
            consent: {
                title: "デジタルチケットの発行",
                instructions: vcTitle[vcName].instructions
            },
            claims: vcTitle[vcName].claims,
            id: "display"
        },
        input: {
            credentialIssuer: conf.domain + "issue/" + req.params.uuid,
            issuer: conf.did,
            attestations: {
                idTokens: [
                    {
                        id: "https://self-issued.me",
                        encrypted: false,
                        claims: [],
                        required: false,
                        configuration: "https://self-issued.me",
                        client_id: "",
                        issuers: [],
                        redirect_uri: ""
                    }
                ]
            },
            id: "input"
        },
        iss: conf.did,
        iat: now
    }

    let jwt = await didJWT.createJWT(
        payload,
        { issuer: conf.did, signer: conf.signer },
        { alg: 'ES256K', kid: conf.did + '#auth-key' }
    );

    res.set('Content-Type', 'application/json');
    res.send(`{"token":"${jwt}"}`);
});

module.exports = router;
