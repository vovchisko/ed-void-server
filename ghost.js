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


async function init() {

    console.log('DATABSE: CONNECTED ' + cfg.database.host + ':' + cfg.database.port);
    console.log('  VOID_DB - ' + cfg.database.db_void);
    console.log('   JRN_DB - ' + cfg.database.db_journals);

    /*
        UNI.on(EV_PIPE, (uid, rec_event, rec) => {
            console.log('EV_PIPE::', uid, 'pipe:' + rec_event, rec);
        });

        UNI.on(EV_NET, (uid, uni_event, data) => {
            console.log('EV_NET::', uid, 'uni:' + uni_event, data);
        });
    */

    UNI.init();

    // await re_index_journals();

    await re_process();
    
}


async function re_index_journals(cb) {
    let count = await DB.cmdrs.count();
    console.log('\n>> RE_INDEXING JOURNALS...');
    let cmdrs = DB.cmdrs.find();
    while (await cmdrs.hasNext()) {
        const c = await cmdrs.next();
        let user = await UNI.get_user({_id: c.uid});
        await user.set_cmdr(c.name);
        user.journal();
    }
}

async function re_process() {
    let count = await DB.cmdrs.count();
    console.log('\n>> RE_PROCESSING CMDRS JOURNALS...');

    let cmdrs = DB.cmdrs.find();//.addCursorFlag('noCursorTimeout', true);

    let i = 0;

    let start_all = new Date().getTime();

    while (await cmdrs.hasNext()) {
        let start_j = new Date().getTime();
        let c = await cmdrs.next();
        let r = 0;
        let journal = null;
        let user = await UNI.get_user({_id: c.uid});

        await user.set_cmdr(c.name);
        user._cmdr.__reset();

        let total_r = await user.journal().count();
        journal = await user.journal().find().sort({timestamp: 1});//.addCursorFlag('noCursorTimeout', true);

        console.log(`${++i}/${count}\t ${c.uid}\t CMDR: ${c.name}`);
        console.log(`records: ${total_r}`);

        let per_bar = Math.floor(total_r / 64);
        let records_stack = [];
        while (await journal.hasNext()) {
            const rec = await journal.next();
            records_stack.push(rec);
            if (r > per_bar) {
                process.stdout.write("\u2592");
                r = 0;
            } else {++r;}
            await UNI.process(user._cmdr, rec);
        }

//        for (let i = 0; i < records_stack.length; i++) {
//            await UNI.process(user._cmdr, rec);
//        }


        await journal.close();
        let end_j = new Date().getTime() - start_j;
        console.log(`\n\u2713 took: ${end_j / 1000}sec\``);
        console.log('')

    }
    await cmdrs.close();
    let end_all = new Date().getTime() - start_all;
    console.log(`total time: ${end_all / 1000}sec`);
}


function pause(t) {
    return new Promise((resolve, reject) => {
        setTimeout(() => { resolve(); }, t)
    })
}