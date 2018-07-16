"use strict";
/*
    API v.0.2
    Retrieve all available tracks.

    PARAMS: none
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
            tracks: [],
        };
        let log = 'API/S-TRACKS: ';
        try {
            let head = req.headers;
            let user = await UNI.get_user({api_key: head.api_key});
            if (user) {
                let tracks = await DB.run_tracks.find().limit(10);
                while (await tracks.hasNext()) {
                    result.tracks.push(await tracks.next());
                }
                result.result = 1;
                result.type = 'info';
                result.text = 'found ' + result.tracks.length + ' tracks';
                res.statusCode = 200;

            } else {
                res.statusCode = 498;
                result.text = 'invalid api-key';
            }
        } catch (e) {
            res.statusCode = 500;
            result.text = 'operation failed';
        }
        //clog(result);
        res.end(JSON.stringify(result));
        //clog(log + result.text);
    });
};



