"use strict";
/*
    API v.0.2
    Reset api-key and re-login all cleints
*/

const clog = require('../../clog');
const server = require('../../server');
const UNI = require('../universe');
const DB = server.DB;

module.exports = function (req, res) {
    server.handle_request(req, res, async (req, res, buffer) => {
        let result = {
            result: 0,
            type: 'error',
            text: 'unknown error'
        };
        let log = 'APIKEY_RST: ';
        try {
            let dat = server.parse_json(buffer.toString());
            if (!dat) return res.end();
            let head = req.headers;
            let user = await UNI.get_user({api_key: head.api_key});
            if (user) {

                server.JCL.wss.drop_client(user._id);
                server.CLS.wss.drop_client(user._id);

                user.touch({
                    api_key: DB.some_hash(),
                });

                await user.save();

                result.result = 1;
                result.type = 'info';
                result.text = 'new api-key - we got it!';

            } else {
                res.statusCode = 498;
                result.text = 'invalid current api-key';
            }
        } catch (e) {
            res.statusCode = 500;
            result.text = 'operation failed';
        }
        res.end(JSON.stringify(result));
        clog(log + result.text);
    });
};



