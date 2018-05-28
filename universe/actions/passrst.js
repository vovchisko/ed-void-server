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
                // verification procedure require only secret key
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
                // to request new validation email need header with api_key and correct email in body
                if (dat.email) {
                    dat.email = dat.email.toLowerCase();
                    let user = await UNI.get_user({email: dat.email});
                    if (user && dat.email === user.email) {
                        server.EML.send_passrst(dat.email, user.secret);
                        result.result = 1;
                        result.type = 'info';
                        result.text = 'We sent a email with validation link to you.\nCheck your mail box.';
                    } else result.text = 'invalid email or api-key';
                } else result.text = 'invalid email or api-key';
            }


        } catch (e) {
            res.statusCode = 500;
            result.result = 0;
            result.text = 'operation failed';
            console.log(log, result.text, e);
        }
        res.end(JSON.stringify(result));
        console.log(log + result.text);
    });
};



