const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const kgig3Schema = new mongoose.Schema({
    username: String,
    uuid: String,
    band: String,
    vcid: String,
    again: Boolean,
    seqnum: Number,
    issued: Date,
    verified: Date,
    received: Date,
    mailCount: Number,
    mailDate: Date
});

const Kgig3Db = mongoose.model("Kgig3Db", kgig3Schema);

async function getUuid(username) {
    let r = await Kgig3Db.findOne({ username: username });
    if (r) {
        return r.uuid;
    }

    let uuid = uuidv4();
    r = new Kgig3Db({
        username: username,
        uuid: uuid,
        again: false,
        mailcount: 0
    });
    await r.save();
    return uuid;
}

function retobj(record) {
    return {
        username: record.username,
        uuid: record.uuid,
        band: record.band,
        vcid: record.vcid,
        again: record.again,
        seqnum: record.seqnum,
        issued: record.issued,
        verified: record.verified,
        received: record.received,
        mailCount: record.mailCount,
        mailDate: record.mailDate
    }
}

async function findByUuid(uuid) {
    let r = await Kgig3Db.findOne({ uuid: uuid });
    if (!r) {
        return null;
    }

    return retobj(r);
}

async function findByVcid(vcid) {
    let r = await Kgig3Db.findOne({ vcid: vcid });
    if (!r) {
        return null;
    }

    return retobj(r);
}

async function findAll() {
    let retval = [];
    let cursor = Kgig3Db.find().cursor();
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        retval.push(retobj(doc));
    }

    return retval;
}

async function setSeqNum(uuid) {
    // XXX: transaction!
    let r = await Kgig3Db.findOne({ uuid: uuid });
    if (!r) {
        return null;
    }

    if (r.seqnum) {
        r.again = true;
        await r.save();
        return false;
    }

    let done = await Kgig3Db.find({ seqnum: { "$ne": null } });
    if (done.length == 0) {
        r.seqnum = 1;
    } else {
        let maxnum = done.reduce((x, y) => { return x.seqnum > y.seqnum ? x : y });
        r.seqnum = maxnum.seqnum + 1;
    }
    r.verified = new Date();
    await r.save();

    return true;
}

async function setVcId(uuid, vcid) {
    let r = await Kgig3Db.findOne({ uuid: uuid });
    if (!r) {
        return false;
    }

    r.vcid = vcid;
    r.issued = new Date();
    await r.save();
    return true;
}

async function setBand(uuid, band) {
    let r = await Kgig3Db.findOne({ uuid: uuid });
    if (!r) {
        return false;
    }

    r.band = band;
    await r.save();
    return true;
}

async function setVerifiedDate(uuid) {
    let r = await Kgig3Db.findOne({ uuid: uuid });
    if (!r) {
        return false;
    }

    r.verified = new Date();
    await r.save();
    return true;
}

async function setReceivedDate(uuid) {
    let r = await Kgig3Db.findOne({ uuid: uuid });
    if (!r) {
        return false;
    }

    r.received = new Date();
    await r.save();
    return true;
}

async function setMailDate(uuid) {
    let r = await Kgig3Db.findOne({ uuid: uuid });
    if (!r) {
        return false;
    }

    if (!r.mailCount) {
        r.mailCount = 1;
    } else {
        r.mailCount += 1;
    }

    r.mailDate = new Date();
    await r.save();
    return true;
}

async function db_init(req, res, next) {
    if (req.app.initDb) {
        next();
        return;
    }

    if (!process.env.DATABASE_URL
        && process.env.KEY_VAULT_SECRET_NAME_DATABASE_URL
        && process.env.KEY_VAULT_NAME) {
        const { DefaultAzureCredential } = require("@azure/identity");
        const { SecretClient } = require("@azure/keyvault-secrets");
        const credential = new DefaultAzureCredential();
        const url = `https://${process.env.KEY_VAULT_NAME}.vault.azure.net`;
        const client = new SecretClient(url, credential);
        const latestSecret = await client.getSecret(
            process.env.KEY_VAULT_SECRET_NAME_DATABASE_URL
        );
        process.env.DATABASE_URL = latestSecret.value;
    };

    await mongoose.connect(process.env.DATABASE_URL);

    req.app.initDb = true;
    next();
}

module.exports.getUuid = getUuid;
module.exports.findByUuid = findByUuid;
module.exports.findByVcid = findByVcid;
module.exports.findAll = findAll;
module.exports.setVcId = setVcId;
module.exports.setBand = setBand;
module.exports.setSeqNum = setSeqNum;
module.exports.setVerifiedDate = setVerifiedDate;
module.exports.setReceivedDate = setReceivedDate;
module.exports.setMailDate = setMailDate;
module.exports.db_init = db_init;