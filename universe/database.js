'use strict';


const MongoClient = require('mongodb').MongoClient;
const shortid = require('shortid');
const crypto = require('crypto');

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


    connect(callback) {
        MongoClient
            .connect('mongodb://' + this.cfg.host + ':' + this.cfg.port)
            .then((client) => {

                this.db_void = client.db(this.cfg.db_void);
                this.db_journals = client.db(this.cfg.db_journals);

                this.db_void.once('close', () => { throw new Error('DB:: CONNECTION_CLOSED: db_void') });
                this.db_journals.once('close', () => { throw new Error('DB:: CONNECTION_CLOSED: db_journals'); });

                this.bind_collections();

                callback();
            })
            .catch((err) => {
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

    bind_collections() {
        this.reports = this.db_void.collection('reports');
        this.cmdrs = this.db_void.collection('cmdrs');
        this.users = this.db_void.collection('users');
        this.bodies = this.db_void.collection('bodies');
        this.systems = this.db_void.collection('systems');
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
}

module.exports.current = new Database();


