"use strict";

//
// SIGNUP PROCEDURE
//
const cfg = require('../config');
const the = require('../the');
const db = require('../inner_modules/database').current;
const UNI = require('../universe');
const evs = require('../events_settings');

module.exports = function (req, res) {
    the.handle_request(req, res, async (req, res, buffer) => {
        //	console.log(req.headers);
        try {
            let start = new Date().getTime();

            let res_text = '';
            let records = JSON.parse(buffer.toString());
            let head = req.headers;
            let user = await UNI.get_user({api_key: head.api_key});
            if (user) {
                for (let i = 0; i < records.length; i++) {

                    user.upd_head(head);

                    if (records[i].event === 'Scan' &&
                        records[i].ScanType === 'Detailed' &&
                        (records[i].PlanetClass || records[i].StarType))
                        estimate_value(records[i]);

                    await db.save_user_rec(user, records[i]);

                    if (evs[records[i].event]) {
                        UNI.process_record(records[i], user);
                        if (evs[records[i].event].pipe && i > records.length - 10) UNI.send_to(user._id, 'rec:' + records[i].event, records[i]);
                    }
                }

                res.statusCode = 200;
                res_text = records.length > 1 ? 'proceed ' + records.length + ' records' : 'proceed';
                res_text += ' / ' + (new Date().getTime() - start) + 'ms';
            } else {
                res.statusCode = 498;
                res_text = 'invalid api-key or user name';
            }

            res.end(res_text);

        } catch (e) {
            console.log(e);
            res.statusCode = 500;
            res.end('fail');
        }
    });
};


// estimates ...


function estimate_value(rec) {
    // starts : k + (m * k / 66.25)
    // worlds : k + ( 3 * k * m0.199977 / 5.3 )

    if (rec.PlanetClass) {
        let k = planet_K[rec.PlanetClass] || 720;
        rec.EstimatedValue = k + (3 * k * Math.pow(rec.MassEM, 0.199977) / 5.3);
        if (rec.TerraformState && terr_bonus[rec.PlanetClass]) {
            rec.EstimatedValue += terr_bonus[rec.PlanetClass];
        }
    }

    if (rec.StarType) {
        let k = 2880;
        for (let types in star_K) if (types.includes(' ' + rec.StarType + ' ')) k = star_K[types];
        rec.EstimatedValue = k + (rec.StellarMass * k / 66.25);
    }

    if (rec.EstimatedValue) rec.EstimatedValue = Math.floor(rec.EstimatedValue);


}


let planet_K = {
    "Ammonia world": 232619,
    "Earthlike body": 155581,
    "Water world": 155581,
    "Metal rich body": 52292,
    "High metal content body": 23168,
    "Sudarsky class II gas giant": 23168,
    "Sudarsky class I gas giant": 3974,
};

let terr_bonus = {
    "Earthlike body": 279088,
    "Water world": 279088,
    "High metal content body": 241607,
    "Rocky body": 223971,
};


let star_K = {
    " D DA DAB DAO DAZ DAV DB DBZ DBV DO DOV DQ DC DCV DX ": 33737,
    " N  H ": 54309,
};
