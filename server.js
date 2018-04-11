'use strict';


const cfg = require('./config');
const the = require('./the');
const WSM = require('./inner_modules/ws-manager');
const db = require('./inner_modules/database').current;
const NodeStatic = require('node-static');
const wss_cmdrs = new WSM(cfg.main.ws_cmdr);
const app = new NodeStatic.Server('./app');
const action_signup = require('./actions/signup');
const action_record = require('./actions/record');
const UNI = require('./universe');

require('http').createServer((req, res) => {
    if (req.url === '/signup')
        return action_signup(req, res);

    if (req.url === '/record')
        return action_record(req, res, (cmdr, rec) => {
            if (cfg.main.log) console.log('[' + cmdr.name + ']', rec.event, rec.timestamp);
        });

    req.addListener('end', function () {
        app.serve(req, res);
    }).resume();

}).listen(cfg.main.web_port);

//
// WS ON WEB LOGIN PROCEDURE
//
wss_cmdrs.auth = async function (cmd, dat, callback) {
    if (cmd !== 'auth') return callback(null);
    let cmdr = await UNI.get_cmdr({email: dat.email});

    if (cmdr && cmdr.pass === dat.pass) {
        return callback(cmdr.id);
    } else {
        callback(null);
    }
};

wss_cmdrs.on('disconnected', async (client) => {
    console.log('CMDR', client.cmdr.name.toUpperCase(), 'leave');
});
wss_cmdrs.on('connected', async (client) => {

    let cmdr = await UNI.get_cmdr({id: client.id});

    if (!cmdr) {
        return client.close();
        throw new Error('something went wrong here');
    }

    client.cmdr = cmdr;
    client.c_send('cmdr', {
        name: client.cmdr.name,
        api_key: client.cmdr.api_key,
    });
    client.cmdr.online = true;

    console.log('CMDR', client.cmdr.name.toUpperCase(), 'online');

});

db.connect(cfg.db, async () => {
    wss_cmdrs.init();
    console.log('Whoosh! MASTER READY!');
    console.log('localhost:' + cfg.main.web_port);
});

process.on('unhandledRejection', error => console.error('unhandledRejection', error));
