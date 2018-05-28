"use strict";
/*
    API v.0.2
    Process reseting password
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

        let log = 'PASS-RST: ';

        try {
            let dat = server.parse_json(buffer.toString());
            if (!dat) return res.end();

            if (dat.secret) {
                let user = await UNI.get_user({secret: dat.secret});

                if (!dat.pass || dat.pass.length < 5)
                    return res.end(JSON.stringify({result: 0, type: 'error', text: 'new password is required (atleast 5 symbols)'}));

                if (user) {
                    user.touch({
                        valid: true,
                        pass: server.DB.hash(dat.pass),
                        secret: server.DB.some_hash(),
                    });
                    await user.save();
                    result.api_key = user.api_key;
                    result.result = 1;
                    result.type = 'info';
                    result.text = 'new password confirmed';
                } else {
                    result.text = 'operation failed';
                }
            } else {
                if (!dat.email) return res.end(JSON.stringify({result: 0, type: 'error', text: 'invalid email'}));
                dat.email = dat.email.toLowerCase();
                let user = await UNI.get_user({email: dat.email});
                if (!user) return res.end(JSON.stringify({result: 0, type: 'error', text: 'invalid email'}));

                server.EML.send_passrst(dat.email, user.secret);

                result.result = 1;
                result.type = 'info';
                result.text = 'We sent you email with rescue link.\nCheck your mail box.';
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



