"use strict";
/*
    API v.0.2
    Process change user passwrd using api_key and old password.
*/

const server = require('../../server');
const UNI = require('../universe');
const DB = server.DB;
const clog = require('../../clog');

module.exports = function (req, res) {
    server.handle_request(req, res, async (req, res, buffer) => {
        let re = {
            result: 0,
            type: 'error',
            text: 'unknown error'
        };
        let log = 'POI/REP: ';
        try {
            let report = server.parse_json(buffer.toString());
            if (!report) return res.end();
            let head = req.headers;
            let user = await UNI.get_user({api_key: head.api_key});
            if (user) {
                re = await _poi_submit(user, report); // user and report - we have it!

                log += `${user._id} ... `;

            } else {
                res.statusCode = 498;
                re.text = 'invalid api-key';
            }
        } catch (e) {
            res.statusCode = 500;
            re.text = 'operation failed';
        }
        res.end(JSON.stringify(re));
        clog(log + re.text);
    });
};


async function _poi_submit(user, report) {
    let r = {
        _id: null,
        type: 'NA',
        system: '',
        body: '',
        subject: '',
        description: '',
        links: [],
        pub: false, //other peopl can find it
        locked: false, //report confirmed nad locked
        lat: '',
        lon: '',
        reporter: null,
        screens: {
            cockpit: '',
            sys_map: ''
        },
        parent_id: null, //for a few reports in the same place
        starpos: [0, 0, 0], // get automatically from the system
        sys_id: null, // get automatically from
        body_id: null,
    };


    if (report._id) {
        r = await DB.reports.findOne({_id: report._id});
        if (r.locked || user._id !== r.uid) return {
            result: 0,
            text: 'Report has been locked!',
            desc: 'This has been verified and locked, and can`t be edited.',
        }
    } else {
        r._id = DB.gen_id();
        r.uid = user._id;
        r.submited = new Date(Date.now());
    }

    if (!report.subject) {
        return {
            result: 0,
            type: 'error',
            text: 'Report Subject not specified!',
            desc: 'This field is required for this type of reports'
        };
    }

    if (!report.system) {
        return {
            result: 0,
            type: 'error',
            text: 'System not specified!',
            desc: 'Location section should contain valid system name'
        };
    }

    if (!report.reporter) {
        return {
            result: 0,
            type: 'error',
            text: 'Reporter CMDR name is requierd',
            desc: 'You can\'t submit report anonymously'
        };
    }

    if (!report.reporter) {
        return {
            result: 0,
            type: 'error',
            text: 'Reporter CMDR name is requierd',
            desc: 'You can\'t submit report anonymously'
        };
    }

    r.type = report.type;
    r.sub_type = report.sub_type;
    r.subject = report.subject;
    r.system = report.system;
    r.body = report.body;
    r.description = report.description;
    r.pub = report.pub;
    r.lat = report.lat;
    r.lon = report.lon;
    r.reporter = report.reporter;

    r.links = report.links;

    r.screens.cockpit = report.screens.cockpit;
    r.screens.sys_map = report.screens.sys_map;

    //user can't edit
    r.starpos = report.starpos;
    r.sys_id = report.sys_id;
    r.body_id = report.body_id;
    r.updated = new Date(Date.now());

    await DB.reports.save(r);

    return {
        result: 1,
        type: 'info',
        text: 'report submited successfully',
        desc: 'report has been saved to your reports database',
        report: r
    };

}


