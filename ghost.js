global.GHOST = true;

'use strict';

const server = {};

global.GHOST = true;

exports = module.exports = server;

const tools = server.tools = require('./universe/tools');
const cfg = server.cfg = require('./config');
const DB = server.DB = require('./universe/services/database');
const UNI = server.UNI = require('./universe/universe');


DB.connect(cfg.database, init);

process.on('unhandledRejection', (error) => {
    console.log('ERROR: unhandledRejection', error);
    process.exit(-1);
});

function init() {

    console.log('DATABSE: CONNECTED ' + cfg.database.host + ':' + cfg.database.port);
    console.log('  VOID_DB - ' + cfg.database.db_void);
    console.log('   JRN_DB - ' + cfg.database.db_journals);


    UNI.on(EV_PIPE, (uid, rec_event, rec) => {
        console.log('EV_PIPE::', uid, 'pipe:' + rec_event, rec);
    });

    UNI.on(EV_NET, (uid, uni_event, data) => {
        console.log('EV_NET::', uid, 'uni:' + uni_event, data);
    });

    UNI.init();

    DB.cmdrs.find({})
        .forEach(cmdr => { console.log(cmdr); })


}




