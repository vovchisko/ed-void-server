'use strict';

const MongoClient = require('mongodb').MongoClient;
const shortid = require('shortid');
const crypto = require('crypto');
const extend = require('deep-extend');
const clog = require('../../clog');
const sh = require("shorthash");
class Database {
    constructor() {
        //databases links
        this.db_void = null;
        this.db_journals = null;

        //journals collections links
        this.journals = {};

        //database settings
        this.cfg = {
            host: '127.0.0.1',
            port: 27017,
            db_void: 'ed-void',
            db_journals: 'ed-void-rec',
        };
    }


    connect(cfg, callback) {
        extend(this.cfg, cfg);
        MongoClient
            .connect('mongodb://' + this.cfg.host + ':' + this.cfg.port)
            .then(async (client) => {
                this.db_void = client.db(this.cfg.db_void);
                this.db_journals = client.db(this.cfg.db_journals);
                await this.bind_collections();
                this.db_void.once('close', () => { throw new Error('DB:: CONNECTION_CLOSED: db_void') });
                this.db_journals.once('close', () => { throw new Error('DB:: CONNECTION_CLOSED: db_journals'); });
                callback();
            })
            .catch((err) => {
                clog('DB::connect() Failed!', err);
                process.exit(-1);
            });
    }

    shash(string){
       return sh.unique(string);
    }

    gen_id() {
        return shortid.generate();
    }

    some_hash() {
        return this.hash(shortid.generate());
    };

    async bind_collections() {
        //await this.wipe_data();

        this.users = this.db_void.collection('users'); // don't drop!
        this.cmdrs = this.db_void.collection('cmdrs');

        this.reports = this.db_void.collection('reports');
        this.bodies = this.db_void.collection('bodies');
        this.systems = this.db_void.collection('systems');
        this.stations = this.db_void.collection('stations');

        this.exp_data = this.db_void.collection('exp_data');
        this.exp_discovered = this.db_void.collection('exp_discovered');

        //summary logs
        this.market = this.db_journals.collection('_log_market');
        this.outfitting = this.db_journals.collection('_log_outfitting');
        this.shipyard = this.db_journals.collection('_log_shipyard');
    };

    hash(string) {
        return crypto.createHash('md5').update(string).digest('hex');
    }

    journal(journal_id) {
        if (!this.journals[journal_id]) {
            this.journals[journal_id] = this.db_journals.collection(journal_id);
        }
        return this.journals[journal_id];
    }

    journal_index(journal_id) {
        return this.db_journals.collection(journal_id).ensureIndex([["timestamp", 1]])
            .then((r) => clog(`DB:: "${journal_id}" >> indexed: ${r}`))
            .catch(e => { clog('DB:: journal()', e)});
    }

}

const DB = new Database();


module.exports = DB;

