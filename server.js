'use strict';

const server = {};

global.PIPE_EVENTS = [
    'Commander', 'Loadout', 'Status',
    'DiscoveryScan', 'Scan',
    'SupercruiseEntry', 'SupercruiseExit', 'FSDJump', 'ApproachBody', 'LeaveBody', 'Location', 'StartJump', 'Docked', 'Undocked', 'Touchdown', 'Liftoff', 'LaunchSRV', 'DockSRV', 'LaunchFighter', 'DockFighter'
];
global.GHOST = false;

exports = module.exports = server;
const NodeStatic = require('node-static');
const WSM = require('./universe/services/ws-manager');
const MailService = require('./universe/services/mailer');
const app = new NodeStatic.Server('./dist', /*{cache: 0}*/);

function pause(t) {
    return new Promise((resolve, reject) => {
        setTimeout(() => { resolve(); }, t)
    });
}

function handle_request(req, res, cb) {

    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
        const data = Buffer.concat(chunks);

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Methods', 'POST');
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, client,  cmdr, lng, gv, api_key');
            return res.end();
        }
        res.setHeader('Content-Type', 'application/json');
        cb(req, res, data);
    });
}

function parse_json(string) {
    try {
        return JSON.parse(string);
    } catch (e) {
        return null;
    }
}

server.handle_request = handle_request;
server.parse_json = parse_json;
server.pause = pause;

const tools = server.tools = require('./universe/tools');
const cfg = server.cfg = require('./config');
const EML = server.EML = new MailService(server.cfg.email);
const DB = server.DB = require('./universe/services/database');
const UNI = server.UNI = require('./universe/universe');
const run = server.run = require('./universe/run');
const clog = server.clog = require('./clog');
const API = {
    'signup': require('./universe/actions/signup'),
    'signin': require('./universe/actions/signin'),
    'record': require('./universe/actions/record'),
    'passch': require('./universe/actions/passch'),
    'everify': require('./universe/actions/everify'),
    'passrst': require('./universe/actions/passrst'),
    'apirst': require('./universe/actions/apirst'),
    'poirep': require('./universe/actions/poirep'),
    's-bodies': require('./universe/actions/s-boides'),
    's-systems': require('./universe/actions/s-systems'),
    's-stations': require('./universe/actions/s-stations'),
    's-tracks': require('./universe/actions/s-tracks'),
};


class Clients {
    constructor() {
        this.wss = null;
        this.port = null;
    }

    init(port) {
        this.port = port;
        this.wss = new WSM(this.port);
        this.wss.name = 'WSM@CLS';
        this.wss.auth = async (cmd, dat, callback) => {
            if (cmd !== 'auth') return callback(null);
            let user = await UNI.get_user({api_key: dat});
            if (user) { return callback(user._id); }
            else { callback(null); }
        };

        this.wss.on('disconnected', async (client) => {
            let user = await UNI.get_user({_id: client.id});
            clog(`USR: ${user._id} [CMDR ${user.cmdr_name}] (web) leave`);
            user.touch({online: false});
        });

        this.wss.on('message', async (client, c, dat) => {
            let user = await UNI.get_user({_id: client.id});
            UNI.user_msg(user, c, dat);
            user.touch({online: true});
        });

        this.wss.on('connected', async (client) => {
            let user = await UNI.get_user({_id: client.id});
            if (!user) return client.close();
            clog(`USR: ${user._id} [CMDR ${user.cmdr_name}] (web) joined`);
            UNI.refill_user(user._id);
            user.touch({online: true});
        });

        this.wss.init();
        clog(`CLS: [${this.port}]: OK`);
    }

    send_to(uid, c, dat) {
        if (this.wss && this.wss.clients[uid]) {
            this.wss.clients[uid].c_send(c, dat);
        }
    }
}


class JCollector {
    constructor() {
        this.wss = null;
        this.port = 0;
    }

    init(port) {
        this.port = port;
        this.wss = new WSM(this.port);
        this.wss.cpu = 1;
        this.wss.name = 'WSM@JCL';

        this.wss.auth = async (cmd, dat, callback) => {
            if (cmd !== 'auth') return callback(null);
            let juser = await UNI.get_user({api_key: dat});
            if (juser) { return callback(juser._id); }
            else { callback(null); }
        };

        this.wss.on('disconnected', async (client) => {
            let juser = await UNI.get_user({_id: client.id});
            clog(`JCL: ${juser._id} [CMDR ${juser.cmdr_name}] (client-app) disconnected`);
            juser.touch({online: false});
        });

        this.wss.on('connected', async (client) => {
            let juser = await UNI.get_user({_id: client.id});
            if (!juser) return client.close();
            clog(`JCL: ${juser._id} [CMDR ${juser.cmdr_name}] (client-app) journal connected`);
            UNI.refill_user(juser._id);
            juser.touch({online: true});
        });

        this.wss.on('message', async (client, c, dat) => {
            let juser = await UNI.get_user({_id: client.id});
            UNI.user_msg(juser, c, dat);
            juser.touch({online: true});
        });

        this.wss.init();
        clog(`JCL: [${this.port}] - OK`);
    }

    send_to(uid, c, dat) {
        if (this.wss && this.wss.clients[uid]) {
            this.wss.clients[uid].c_send(c, dat);
        }
    }
}

const CLS = server.CLS = new Clients();
const JCL = server.JCL = new JCollector();

//
// WS ON WEB LOGIN PROCEDURE
//
require('http').createServer(function (request, response) {

    let route_url = request.url.endsWith('/') ? request.url.slice(0, -1) : request.url;

    if (route_url.includes('/api/')) {
        let method = route_url.split('/')[2];
        if (method && typeof API[method] === 'function') {
            return API[method](request, response);
        } else {
            clog(`SRV: no API method ${route_url}`);
        }
    }

    if (route_url === '/app') // APP
        return app.serveFile('/index.html', 200, {}, request, response);

    if (route_url === '/' || route_url === '') // HOME
        return app.serveFile('/landing.html', 200, {}, request, response);

    // OTHER STATIC
    request.addListener('end', function () {
        app.serve(request, response, function (e, res) {
            if (e && (e.status === 404)) { // If the file wasn't found
                app.serveFile('/error.html', 404, {}, request, response);
            }
        });
    }).resume();

}).listen(cfg.main.port);
clog('WEB & API-SERVER ON PORT: ' + cfg.main.port);

DB.connect(cfg.database, init);

process.on('unhandledRejection', (error) => {
    clog('ERROR: unhandledRejection', error);
    process.exit(-1);
});

function init() {

    clog('DATABSE: CONNECTED ' + cfg.database.host + ':' + cfg.database.port);
    clog('  VOID_DB - ' + cfg.database.db_void);
    clog('   JRN_DB - ' + cfg.database.db_journals);


    UNI.on(EV_PIPE, (uid, rec_event, rec) => {
        try {
            CLS.send_to(uid, 'pipe:' + rec_event, tools.recout(rec));
        } catch (e) {
            console.log(`ERROR! Catched error in CLS.send_to(${uid}, pipe:${rec_event});`, e);
        }

    });

    UNI.on(EV_NET, (uid, uni_event, data) => {
        try {
            JCL.send_to(uid, 'uni:' + uni_event, data);
            CLS.send_to(uid, 'uni:' + uni_event, data);
        } catch (e) {
            console.log(`ERROR! Catched error in CLS.send_to(${uid}, uni:${uni_event});`, e);
        }

    });


    CLS.init(cfg.main.ws_user);
    JCL.init(cfg.main.ws_journals);
    UNI.init();

    clog('http://localhost:' + cfg.main.port);
}




