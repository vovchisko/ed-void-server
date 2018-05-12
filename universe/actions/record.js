"use strict";
/*
    API v.0.2
    Process records form cleint
*/

const server = require('../../server');
const UNI = require('../universe');
const pre = require('../pre');

module.exports = function (req, res) {
    server.handle_request(req, res, async (req, res, buffer) => {

        let res_text = '';
        let log = 'REC: ';

        try {
            let start = new Date().getTime();
            let records = server.parse_json(buffer.toString());
            let head = req.headers;

            let user = await UNI.get_user({api_key: head.api_key});
            if (user) {
                log += `${user._id} [CMDR ${head.cmdr}] ${records.length > 1 ? records.length : records[0].event} ... `;

                for (let i = 0; i < records.length; i++) {
                    pre.process(records[i]);
                    await UNI.record(user, records[i], head.cmdr, head.gv, head.lng);
                    if (records[i].event === 'Status') log = '';//don't log status
                }

                res.statusCode = 200;
                res_text = records.length > 1 ? records.length + ' rec. proceed' : 'proceed';
                res_text += ' / ' + (new Date().getTime() - start) + 'ms';

            } else {
                res.statusCode = 498;
                res_text = 'invalid api-key';
                log += res_text;
            }


        } catch (e) {
            res.statusCode = 500;
            res_text = 'fail';
            console.log(e);
        }

        res.end(res_text);
        if (log) console.log(log + res_text);
    });
};



