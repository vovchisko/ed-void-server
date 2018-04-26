'use strict';


const cfg = require('./config');
const db = require('./universe/database').current;
const NodeStatic = require('node-static');
const app = new NodeStatic.Server('./app', {cache: 0});
const action_signup = require('./universe/actions/signup');
const action_signin = require('./universe/actions/signin');
const action_record = require('./universe/actions/record');
const UNI = require('./universe/universe');
const JCOLL = require('./universe/jcollector');
const CLIENTS = require('./universe/cleints');


require('http').createServer(function (request, response) {

    if (request.url === '/api/record')
        return action_record(request, response);

    if (request.url === '/signup')
        return action_signup(request, response);

    if (request.url === '/signin')
        return action_signin(request, response);

    if (request.url === '/app')
        return app.serveFile('/app.html', 200, {}, request, response);

    request.addListener('end', function () {
        app.serve(request, response, function (e, res) {
            if (e && (e.status === 404)) { // If the file wasn't found
                app.serveFile('/error.html', 404, {}, request, response);
            }
        });

    }).resume();

}).listen(cfg.main.web_port);

console.log('WEB-SERVER ON PORT: ' + cfg.main.web_port);

//
// WS ON WEB LOGIN PROCEDURE
//

db.connect(() => {
    console.log('DATABSE: CONNECTED ' + cfg.database.host + ':' + cfg.database.port);
    console.log('  VOID_DB - ' + cfg.database.db_void);
    console.log('   JRN_DB - ' + cfg.database.db_journals);

    UNI.init();
    JCOLL.init();
    CLIENTS.init();

    console.log('http://localhost:' + cfg.main.web_port);
});

process.on('unhandledRejection', (error) => console.log('ERROR: unhandledRejection', error.stack));
