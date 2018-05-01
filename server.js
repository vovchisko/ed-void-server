'use strict';

const server = {};

global.PIPE_EVENTS = [
    'Commander', 'Loadout', 'Status',
    'DiscoveryScan', 'Scan',
    'SupercruiseEntry', 'SupercruiseExit', 'FSDJump', 'ApproachBody', 'LeaveBody', 'Location', 'StartJump', 'Docked', 'Undocked', 'Touchdown', 'Liftoff', 'LaunchSRV', 'DockSRV', 'LaunchFighter', 'DockFighter'
];

exports = module.exports = server;

const NodeStatic = require('node-static');
const WSM = require('./universe/ws-manager');
const app = new NodeStatic.Server('./app', {cache: 0});

function handle_request(req, res, cb) {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
        const data = Buffer.concat(chunks);
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

const cfg = server.cfg = require('./config');
const DB = server.DB = require('./universe/database');
const UNI = server.UNI = require('./universe/universe');

const action_signup = require('./universe/api/signup');
const action_signin = require('./universe/api/signin');
const action_record = require('./universe/api/record');


class Clients {
    constructor() {
        this.wss_clients = null;
        this.port = null;
    }

    init(port) {
        this.port = port;
        this.wss_clients = new WSM(this.port);
        this.wss_clients.name = 'WSM@CLS';
        this.wss_clients.auth = async (cmd, dat, callback) => {
            if (cmd !== 'auth') return callback(null);
            let user = await UNI.get_user({wtoken: dat});
            if (user) { return callback(user._id); }
            else { callback(null); }
        };

        this.wss_clients.on('disconnected', async (client) => {
            let user = await UNI.get_user({_id: client.id});
            console.log(`USR:${user._id} [ CMDR ${user.cmdr_name} ] leave`);
            user.online = false;
            user.save();
        });

        this.wss_clients.on('connected', async (client) => {

            let user = await UNI.get_user({_id: client.id});

            if (!user) return client.close();

            this.send_to(user._id, 'user', {
                email: user.email,
                api_key: user.api_key
            });

            this.send_to(user._id, 'cmdr', user.cmdr);

            console.log(`USR:${user._id} [ CMDR ${user.cmdr_name} ] joined`);

            if (user.journal()) {
                let scans = user.journal().find({event: 'Scan'}).sort({timestamp: -1}).limit(4);
                scans.forEach((rec) => this.send_to(user._id, 'rec:' + 'Scan', rec));
            }

            user.online = true;
            user.save();
        });

        this.wss_clients.init();
        console.log(`CLIENTS APP WS [${this.port}]: OK`);
    }

    send_to(uid, c, dat) {
        if (this.wss_clients && this.wss_clients.clients[uid]) {
            this.wss_clients.clients[uid].c_send(c, dat);
        }
    }
}


class JCollector {
    constructor() {
        this.wss_journals = null;
        this.port = 0;
    }

    init(port) {
        this.port = port;
        this.wss_journals = new WSM(this.port);
        this.wss_journals.cpu = 1;
        this.wss_journals.name = 'WSM@JCL';

        this.wss_journals.auth = async (cmd, dat, callback) => {
            if (cmd !== 'auth') return callback(null);
            let juser = await UNI.get_user({api_key: dat});
            if (juser) { return callback(juser._id); }
            else { callback(null); }
        };

        this.wss_journals.on('disconnected', async (client) => {
            let juser = await UNI.get_user({_id: client.id});
            console.log(`JCL: ${juser._id} [ CMDR ${juser.cmdr_name} ] - disconnected`);
        });

        this.wss_journals.on('connected', async (client) => {
            let juser = await UNI.get_user({_id: client.id});
            if (!juser) return client.close();

            console.log(`JCL: ${juser._id} [ CMDR ${juser.cmdr_name} ] - connected`);
        });

        this.wss_journals.on('message', async (client, c, dat) => {
            let user = await UNI.get_user({_id: client.id});
            UNI.record(user, dat.rec, dat.cmdr_name, dat.gv, dat.lng);
            if (PIPE_EVENTS.includes(dat.rec.event)) UNI.broadcast(user._id, 'rec:' + dat.rec.event, dat.rec)
        });

        this.wss_journals.init();
        console.log(`JCL: [${this.port}] - OK`);
    }

    send_to(uid, c, dat) {
        if (this.wss_journals && this.wss_journals.clients[uid]) {
            this.wss_journals.clients[uid].c_send(c, dat);
        }
    }
}

const CLS = server.CLS = new Clients();
const JCL = server.JCL = new JCollector();

//
// WS ON WEB LOGIN PROCEDURE
//
require('http').createServer(function (request, response) {

    if (request.url === '/api/record') return action_record(request, response);
    if (request.url === '/signup') return action_signup(request, response);
    if (request.url === '/signin') return action_signin(request, response);
    if (request.url === '/app') return app.serveFile('/app-root.html', 200, {}, request, response);

    request.addListener('end', () => {
        app.serve(request, response, function (err, res) {
            if (err && (err.status === 404)) app.serveFile('/error.html', 404, {}, request, response);
        });
    }).resume();

}).listen(cfg.main.web_port);

console.log('WEB-SERVER ON PORT: ' + cfg.main.web_port);

DB.connect(cfg.database, () => {

    /*
     * Would be nice if Universe just fire events about updates in th same format as messages.
     * So universe just update main DB and fire events about it and about things should be broadcasted.
     *
     * Stuff like "get_user" or something should be moved to database models.
     *
     *
     */

    console.log('DATABSE: CONNECTED ' + cfg.database.host + ':' + cfg.database.port);
    console.log('  VOID_DB - ' + cfg.database.db_void);
    console.log('   JRN_DB - ' + cfg.database.db_journals);

    CLS.init(cfg.main.ws_user);
    JCL.init(cfg.main.ws_journals);
    UNI.init();

    console.log('http://localhost:' + cfg.main.web_port);
});


process.on('unhandledRejection', (error) => console.log('ERROR: unhandledRejection', error.stack));




