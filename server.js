'use strict';

global.UNEXPLORED = 'UNEXPLORED';

const cfg = require('./config');
const db = require('./inner_modules/database').current;
const NodeStatic = require('node-static');
const app = new NodeStatic.Server('./app', { cache: 0 });
const action_signup = require('./actions/signup');
const action_signin = require('./actions/signin');
const action_record = require('./actions/record');
const UNI = require('./universe');

require('http').createServer((req, res) => {

    if (req.url === '/signup')
        return action_signup(req, res);

    if (req.url === '/signin')
        return action_signin(req, res);

    if (req.url === '/record')
        return action_record(req, res);

    req.addListener('end', function () {
        app.serve(req, res);
    }).resume();

}).listen(cfg.main.web_port);

//
// WS ON WEB LOGIN PROCEDURE
//

db.connect(cfg.db, async () => {
    UNI.init();
    console.log('Whoosh! MASTER READY!');
    console.log('http://localhost:' + cfg.main.web_port);
});

process.on('unhandledRejection', error => console.log('ERROR: unhandledRejection', error));
