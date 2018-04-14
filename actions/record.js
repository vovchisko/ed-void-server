"use strict";

//
// SIGNUP PROCEDURE
//
const cfg = require('../config');
const the = require('../the');
const db = require('../inner_modules/database').current;
const UNI = require('../universe');

module.exports = function (req, res, _cb) {
    the.handle_request(req, res, async (req, res, buffer) => {
        //	console.log(req.headers);
        try {
            let res_text = '';
            let records = JSON.parse(buffer.toString());
            let head = req.headers;
            let cmdr = await UNI.get_cmdr({api_key: head.api_key});
            if (cmdr && cmdr.name === head.cmdr) {
                for (let i = 0; i < records.length; i++) {
                    let rec = records[i];
                    rec._id = cmdr.id + '-' + rec.event + '-' + rec.timestamp;
                    rec._cmdr = cmdr.name;
                    rec._cmdr_id = cmdr.id;

                    if (!cfg.records.dont_save.includes(rec.event)) await db.records.save(rec);

                    UNI.process_record(rec);

                    if (i > records.length - 30)
                        UNI.send_cmdr_rec(rec);

                    _cb(cmdr, rec);
                }
                res.statusCode = 200;
                res_text = records.length > 1 ? 'proceed ' + records.length + ' records' : 'record proceed';
            } else {
                res.statusCode = 498;
                res_text = 'invalid api-key or cmdr name';
            }

            res.end(res_text);

        } catch (e) {
            console.log(e);
            res.statusCode = 500;
            res.end('fail');
        }
    });
};
