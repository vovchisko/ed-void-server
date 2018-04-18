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
            let cmdr = await UNI.get_cmdr({api_key: head.api_key});
            if (cmdr && cmdr.name === head.cmdr) {
                for (let i = 0; i < records.length; i++) {

                    await db.save_cmdr_rec(cmdr, records[i]);

                    if (cfg.main.rec_log) console.log('[' + cmdr.name + ']', records[i].timestamp, records[i].event);

                    UNI.process_record(records[i]);

                    if (evs[records[i].event] && evs[records[i].event].pipe && i > records.length - 10)
                        UNI.send_cmdr_rec(records[i]);
                }
                res.statusCode = 200;
                res_text = records.length > 1 ? 'proceed ' + records.length + ' records' : 'proceed';
                res_text += ' / ' + (new Date().getTime() - start) + 'ms';
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
