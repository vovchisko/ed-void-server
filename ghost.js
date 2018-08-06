global.GHOST = true;

'use strict';

const server = {};

global.GHOST = true;

exports = module.exports = server;

const cfg = server.cfg = require('./config');
const DB = server.DB = require('./universe/services/database');
const UNI = server.UNI = require('./universe/universe');
const DATA = require('./ghost-data');

DB.connect(cfg.database, init);


async function init() {

    console.log('DATABSE: CONNECTED ' + cfg.database.host + ':' + cfg.database.port);
    console.log('  VOID_DB - ' + cfg.database.db_void);
    console.log('   JRN_DB - ' + cfg.database.db_journals);

    // UNI.on(EV_PIPE, (uid, rec_event, rec) => { });
    // UNI.on(EV_NET, (uid, uni_event, data) => { });

    UNI.init();

    await re_fill_tracks();

    await wipe_stellars();
    await re_index_void();

    await re_index_journals();
    await re_process();

    console.log('COMPLETE!');
    process.exit(0);

}

async function wipe_stellars() {
    await DB.db_void.collection('bodies').deleteMany({});
    await DB.db_void.collection('systems').deleteMany({});
    await DB.db_void.collection('stations').deleteMany({});
}

async function re_index_void(cb) {
    console.log(`\n>> RE_INDEXING VOID...`);

    await DB.db_void.collection('bodies').ensureIndex([['name', 'text']]);
    await DB.db_void.collection('systems').ensureIndex([['name', 'text']]);
    await DB.db_void.collection('stations').ensureIndex([['name', 'text']]);
}

async function re_index_journals(cb) {
    let count = await DB.cmdrs.count({});
    console.log(`\n>> RE_INDEXING ${count} CMDRS...`);
    let cmdrs = DB.cmdrs.find();
    while (await cmdrs.hasNext()) {
        const c = await cmdrs.next();
        let cmdr = await UNI.get_cmdr(c.uid, c.name);
        await cmdr.journal_index();
    }
}

async function re_process() {
    let count = await DB.cmdrs.count();
    console.log('\n>> RE_PROCESSING CMDRS JOURNALS...');

    let cmdrs = DB.cmdrs.find();

    let i = 0;

    let start_all = new Date().getTime();

    while (await cmdrs.hasNext()) {
        let start_j = new Date().getTime();
        let c = await cmdrs.next();
        let r = 0;
        let journal = null;
        let cmdr = await UNI.get_cmdr(c.uid, c.name);
        cmdr.__reset();

        let total_r = await cmdr.journal().count({});
        journal = await cmdr.journal().find().batchSize(10).sort({timestamp: 1});

        console.log(`${++i}/${count}\t ${c.uid}\t CMDR: ${c.name}`);
        console.log(`records: ${total_r}`);

        let per_bar = Math.floor(total_r / 64);
        let recs = 0;
        while (await journal.hasNext()) {
            let rec = await journal.next();
            await UNI.process(cmdr, rec);
            if (r > per_bar) {
                process.stdout.write("\u00BB");
                r = 0;
            } else {++r;}
            recs++;
        }
        await journal.close();

        process.stdout.write("\n");
        await cmdr.save();
        let end_j = new Date().getTime() - start_j;
        console.log(`\u2713 took: ${end_j / 1000}sec; ${recs} records proceed;`);
        console.log('');

    }
    await cmdrs.close();

    let end_all = new Date().getTime() - start_all;
    console.log(`total time: ${end_all / 1000}sec`);
}

async function  re_fill_tracks() {
    console.log(`\n>> RE_FILL TRACKS...`);
    await DB.run_races.removeMany({});
    await DB.run_tracks.removeMany({});
    for (let i = 0; i < DATA.tracks.length; i++) {
        let r = await DB.run_tracks.save(DATA.tracks[i]);
        console.log(i + ' - ' + DATA.tracks[i]._id + ' :: ' + DATA.tracks[i].name)
    }
}

function pause(t) {
    return new Promise((resolve, reject) => {
        setTimeout(() => { resolve(); }, t)
    })
}