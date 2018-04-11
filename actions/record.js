"use strict";

//
// SIGNUP PROCEDURE
//
const the = require('../the');
const db = require('../inner_modules/database').current;
const UNI = require('../universe');

module.exports = function (req, res, _cb) {
    the.handle_request(req, res, async (req, res, data) => {
        //	console.log(req.headers);
        try {
            let res_text = '';
            let records = JSON.parse(data);

            let head = req.headers;

            let cmdr = await UNI.get_cmdr({api_key: head.api_key});

            if (cmdr && cmdr.name === head.cmdr) {

                for (let i = 0; i < records.length; i++) {
                    let rec = records[i];
                    rec._id = cmdr.id + '-' + rec.event + '-' + rec.timestamp;
                    rec._cmdr = cmdr.name;
                    rec._cmdr_id = cmdr.id;
                    db.records.save(rec);
                    _cb(cmdr, rec);
                }

                res.statusCode = 200;
                res_text = 'ok!';

            } else {
                res.statusCode = 498;
                res_text = 'invalid api-key or cmdr name';
            }

            setTimeout(() => {
                res.end(res_text);
            }, 500);

        } catch (e) {
            console.log(e);
            res.statusCode = 500;
            res.end('fail');
        }
    });
};