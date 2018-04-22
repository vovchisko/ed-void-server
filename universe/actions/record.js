"use strict";

//
// SIGNUP PROCEDURE
//
const cfg = require('../../config');
const the = require('../the');
const db = require('../database').current;
const UNI = require('../universe');
const EVS = require('../events_settings');
const PRE = require('../rec_pre_process');

module.exports = function (req, res) {
    the.handle_request(req, res, async (req, res, buffer) => {

        try {
            let start = new Date().getTime();

            let res_text = '';
            let records = JSON.parse(buffer.toString());
            let head = req.headers;
            let user = await UNI.get_user({api_key: head.api_key});
            if (user) {
                process.stdout.write('REC [' + user._id + '] : (' + records.length + ') items / ' + head.cmdr + ' ... ');

                for (let i = 0; i < records.length; i++) {

                    user.upd_head(head);

                    PRE.process(records[i]);

                    await db.save_user_rec(user, records[i]);

                    if (EVS[records[i].event]) {
                        UNI.post_process(records[i], user);
                        if (EVS[records[i].event].pipe && i > records.length - 5) UNI.send_to(user._id, 'rec:' + records[i].event, records[i]);
                    }
                }

                res.statusCode = 200;
                res_text = records.length > 1 ? 'proceed ' + records.length + ' records' : 'proceed';
                res_text += ' / ' + (new Date().getTime() - start) + 'ms';
            } else {
                res.statusCode = 498;
                res_text = 'invalid api-key or user name';
            }
            process.stdout.write(res_text + '\n');

            res.end(res_text);

        } catch (e) {
            console.log(e);
            res.statusCode = 500;
            res.end('fail');
        }
    });
};



