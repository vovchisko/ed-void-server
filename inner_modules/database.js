'use strict';


const MongoClient = require('mongodb').MongoClient;
const shortid = require('shortid');

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

Database.prototype.bind_collections = function () {
    this.cmdrs = this.db.collection('cmdrs');
    this.records = this.db.collection('records');
};

/**
 * Generate ID with prefix ('U' - unit, 'I' - item, and so on)
 * @param prefix
 * @returns {string}
 */
Database.prototype.id = function (prefix = 'Х') {
    return prefix + '-' + shortid.generate();
};

Database.prototype.generate_api_key = function () {
    return 'A-' + shortid.generate() + shortid.generate() + shortid.generate();
};

Database.prototype.generate_token = function () {
    return 'T-' + shortid.generate();
};

module.exports.current = new Database();