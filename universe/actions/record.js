"use strict";
/*
    API v.0.2
    Process records form cleint
*/
const the = require('../the');
const UNI = require('../universe');


module.exports = function (req, res) {
    the.handle_request(req, res, async (req, res, buffer) => {

        let res_text = '';
        let log = 'REC:';

        try {
            let start = new Date().getTime();
            let records = JSON.parse(buffer.toString());

            let head = req.headers;


            let user = await UNI.get_user({api_key: head.api_key});
            if (user) {
                log += `${user._id} [ CMDR ${head.cmdr} ] load:${records.length} ... `;

                for (let i = 0; i < records.length; i++)
                    await UNI.record(user, head, records[i], (i > records.length - 5));

                res.statusCode = 200;
                res_text = records.length > 1 ? 'proceed ' + records.length + ' records' : 'proceed';
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
        console.log(log + res_text);
    });
};



