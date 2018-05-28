"use strict";
/*
    API v.0.2
    Process email verification
*/

const server = require('../../server');
const UNI = require('../universe');

module.exports = function (req, res) {
    server.handle_request(req, res, async (req, res, buffer) => {

        let result = {
            result: 0,
            type: 'error',
            text: ''
        };

        let log = 'E-VERIFY: ';

        try {
            let dat = server.parse_json(buffer.toString());
            if (!dat) return res.end();

            let user = await UNI.get_user({secret: dat.secret});
            if (user) {
                user.touch({
                    valid: true,
                    secret: server.DB.some_hash(), //reset secret so old can't be used anymore for pass reset
                });
                await user.save();
                result.api_key = user.api_key;
                result.result = 1;
                result.type = 'info';
                result.text = 'account email verified';
            } else {
                result.text = 'invalid secret key';
            }
        } catch (e) {
            res.statusCode = 500;
            result.result = 0;
            result.text = 'operation failed';
            console.log(log, result.text, e);
        }
        res.end(JSON.stringify(result));
        if (log && server.cfg.rec_log) console.log(log + result.text);
    });
};


