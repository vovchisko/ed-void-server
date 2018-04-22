'use strict';


const MongoClient = require('mongodb').MongoClient;
const shortid = require('shortid');
const EVS = require('../events_settings');
const EV_UNKNOWN = '_etc';

module.exports.current = new Database();

function Database() {
    this.dburl = '';
    this.rec = {};
}

Database.prototype.connect = function (cfg, callback) {
    const _self = this;
    this.cfg = cfg;
    this.dburl = 'mongodb://' + this.cfg.host + ':' + this.cfg.port;

    MongoClient.connect(_self.dburl, function (err, client) {
        if (err)
            throw new Error('DB:: CONNECTION_ERR: ' + _self.dburl);

        _self._db = client.db(_self.cfg.dbname);
        _self._rec = client.db(_self.cfg.dbname + '-rec');
        _self._db.once('close', () => {
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

    this.users = this._db.collection('_users');
    this.bodies = this._db.collection('_bodies');
    this.systems = this._db.collection('_systems');

    for (let i in EVS) {
        if (EVS[i].save) this.rec[i] = this._rec.collection(i);
    }

    this.rec[EV_UNKNOWN] = this._rec.collection(EV_UNKNOWN);
};

Database.prototype.save_user_rec = function (user, rec) {

    rec._id = user._id + '/' + user.curr_cmdr + '/' + rec.timestamp;
    rec.timestamp = new Date(rec.timestamp);
    rec._cmdr = user.curr_cmdr;
    rec._uid = user._id;
    rec._lng = user.lng;
    rec._gv = user.gv;

    let c = rec.event;

    if (typeof EVS[rec.event] === 'undefined') c = EV_UNKNOWN;

    return this.rec[c].save(rec);
};
