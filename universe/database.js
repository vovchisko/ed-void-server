'use strict';

const MongoClient = require('mongodb').MongoClient;
const shortid = require('shortid');
const crypto = require('crypto');
const extend = require('deep-extend');

console.log(shortid.generate());


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
                setTimeout(() => process.exit(-1), 10);
                throw err;
            });
    }

    gen_id() {
        return shortid.generate();
    }

    generate_api_key() {
        return 'A' + shortid.generate() + shortid.generate();
    };

    generate_token() {
        return 'T' + shortid.generate() + shortid.generate();
    };

    async bind_collections() {
        //await this.wipe_data();

        this.users = this.db_void.collection('users'); // don't drop!
        this.cmdrs = this.db_void.collection('cmdrs');

        this.reports = this.db_void.collection('reports');
        this.bodies = this.db_void.collection('bodies');
        this.systems = this.db_void.collection('systems');

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

    async wipe_data() {
        await this.db_void.collection('cmdrs').deleteMany({});

        await this.db_void.collection('reports').deleteMany({});
        await this.db_void.collection('bodies').deleteMany({});
        await this.db_void.collection('systems').deleteMany({});

    }
}

const DB = new Database();
module.exports = DB;

