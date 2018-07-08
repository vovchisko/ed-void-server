"use strict";
/*
    API v.0.2
    Find body by specified parameters.

    PARAMS: {
        search: <String> part of name,
        //OR
        ... other criterias
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
        let log = 'API/S-BODIES: ';
        try {
            let params = server.parse_json(buffer.toString());
            if (!params) return res.end();
            let head = req.headers;
            let user = await UNI.get_user({api_key: head.api_key});
            if (user) {
                let bodies; // future cursor
                let query = {};

                if (params.search) query = {name: {$regex: `^${server.tools.safe_regexp(params.search.toLowerCase())}.*`}};
                //query = {$text: {$search: '"' + params.search + '"'}}

                bodies = await DB.bodies.find(query).limit(10);

                while (await bodies.hasNext()) {
                    result.bodies.push(await bodies.next());
                }

                result.result = 1;
                result.type = 'info';
                result.text = 'found ' + result.bodies.length + ' bodies';
                res.statusCode = 200;

                clog(result);
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



