"use strict";
/*
    API v.0.2
    Find body by specified parameters.

    PARAMS: {
        name: <String> part of name,
    }
*/

const server = require('../../server');
const UNI = require('../universe');
const DB = server.DB;
const clog = require('../../clog');

module.exports = function (req, res) {
    server.handle_request(req, res, async (req, res, buffer) => {
        let result = {
            result: 0,
            type: 'error',
            text: 'unknown error',
            bodies: [],
        };
        let log = 'SEARCH: ';
        try {
            let dat = server.parse_json(buffer.toString());
            if (!dat) return res.end();
            let head = req.headers;
            let user = await UNI.get_user({api_key: head.api_key});
            if (user) {
                if (user.pass === DB.hash(dat.curr_pass)) {
                    if (dat.new_pass && dat.new_pass.length >= 5) {

                        //server.JCL.wss.drop_client(user._id);
                        //server.CLS.wss.drop_client(user._id);

                        user.touch({
                            pass: DB.hash(dat.new_pass),
                            // api_key: DB.some_hash(),
                        });
                        await user.save();
                        result.result = 1;
                        result.type = 'info';
                        result.text = 'password successfully changed';
                    } else {
                        result.text = 'new passwrd should contain atleast 5 chars';
                    }
                } else {
                    result.text = 'invalid current password';
                }
            } else {
                res.statusCode = 498;
                result.text = 'invalid api-key';
            }
        } catch (e) {
            res.statusCode = 500;
            result.text = 'operation failed';
        }
        res.end(JSON.stringify(result));
        clog(log + result.text);
    });
};



