'use strict';


const MongoClient = require('mongodb').MongoClient;
const shortid = require('shortid');
const EVS = require('../events_settings');
const EV_COLL_PREFIX = 'ev_';

module.exports.current = new Database();

function Database() {
    this.dburl = '';
}

Database.prototype.connect = function (cfg, callback) {
    const _self = this;
    this.cfg = cfg;
    this.dburl = 'mongodb://' + this.cfg.host + ':' + this.cfg.port;

    MongoClient.connect(_self.dburl, function (err, client) {
        if (err)
            throw new Error('DB:: CONNECTION_ERR: ' + _self.dburl);

        _self.db = client.db(_self.cfg.dbname);
        _self.db.once('close', () => {
            throw new Error('DB:: CONNECTION_CLOSED: ' + _self.dburl);
        });

        _self.bind_collections();

        callback();
    });
};


/**
 * Generate ID with prefix ('U' - unit, 'I' - item, and so on)
 * @param prefix
 * @returns {string}
 */
Database.prototype.gen_id = function (prefix = 'Х') {
    return prefix + '-' + shortid.generate();
};

Database.prototype.generate_api_key = function () {
    return 'A-' + shortid.generate() + shortid.generate() + shortid.generate();
};

Database.prototype.generate_token = function () {
    return 'T-' + shortid.generate();
};

Database.prototype.bind_collections = function () {
    this.cmdrs = this.db.collection('_cmdrs');
    for (let i in EVS) {
        this[i] = this.db.collection(EV_COLL_PREFIX + i);
    }
    this.unknown = this.db.collection(EV_COLL_PREFIX + 'x');




};

Database.prototype.save_cmdr_rec = function (cmdr, rec) {

    rec._id = cmdr.id + '-' + rec.timestamp;
    rec._cmdr = cmdr.name;
    rec._cmdr_id = cmdr.id;

    let coll = rec.event;
    if (typeof EVS[rec.event] === 'undefined') {
        console.log('INVALID EVENT COLLECTION: ', '[' + rec.event + ']', rec);
        coll = 'unknown';
    }

    return this[coll].save(rec);

};
