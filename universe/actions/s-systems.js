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
            systems: [],
        };
        let log = 'API/S-SYSTEMS: ';
        try {
            let params = server.parse_json(buffer.toString());
            if (!params) return res.end();
            let head = req.headers;
            let user = await UNI.get_user({api_key: head.api_key});
            if (user) {
                let systems; // future cursor
                let query = {};

                if (params.search) {
                    //todo: is this reaaly the only way?
                    query = {name: {$regex: `^${params.search.toLowerCase()}.*`}};
                    console.log(query);
                    //query = {$text: {$search: '"' + params.search + '"'}}
                } else {
                    //todo: search by specified parameters
                }

                systems = await DB.systems.find(query).limit(10);

                while (await systems.hasNext()) {
                    result.systems.push(await systems.next());
                }

                result.result = 1;
                result.type = 'info';
                result.text = 'found ' + result.systems.length + ' systems';
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



