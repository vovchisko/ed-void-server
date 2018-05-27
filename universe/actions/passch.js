"use strict";
/*
    API v.0.2
    Process records form cleint
*/

const server = require('../../server');
const UNI = require('../universe');
const DB = server.DB;

module.exports = function (req, res) {
    server.handle_request(req, res, async (req, res, buffer) => {

        let res_text = '';
        let log = 'REC: ';

        try {
            let start = new Date().getTime();
            let dat = server.parse_json(buffer.toString());

            if (!dat) res.end();

            let head = req.headers;

            let user = await UNI.get_user({api_key: head.api_key});

            if (user) {
                if (user.pass === DB.hash(dat.curr_pass)) {
                    if (!dat.new_pass)
                        return res.end(JSON.stringify({
                            result: 0,
                            type: 'error',
                            text: 'new password not specified'
                        }));

                    user.touch({
                        pass: DB.hash(dat.new_pass),
                        api_key: DB.generate_api_key(),
                    });

                    await user.save();
                    return res.end(JSON.stringify({
                        result: 1,
                        type: 'info',
                        text: 'password successfully changed'
                    }));
                } else {
                    return res.end(JSON.stringify({
                        result: 0,
                        type: 'error',
                        text: 'invalid current pass'
                    }));
                }
            } else {
                res.statusCode = 498;
                res_text = 'invalid api-key';
                log += res_text;
            }
        } catch (e) {
            res.statusCode = 500;
            res_text = 'fail';
            console.log(log, res_text, e);
        }

        res.end(res_text);
        if (log && server.cfg.rec_log) console.log(log + res_text);
    });
};



