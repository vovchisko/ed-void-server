const extend = require('deep-extend');
const clog = require('../clog');
const tools = require('./tools');

let UNI;
let DB;

/**
 * init USER module
 * @param uni {Universe}
 * @param db {Database}
 * @returns {USER}
 */
module.exports.init = function (uni, db) {
    UNI = uni;
    DB = db;
    return USER;
};


class USER {
    constructor(data) {
        this._id = '';
        this._ch = true;
        this.email = '';
        this.api_key = '';
        this.cmdr_name = '';
        this.last_rec = new Date(0);
        this.cmdrs = [];
        this.online = false;
        this.dev = false;
        this.valid = false;
        this._rec_left = 0;
        this._overload = false;
        this._overtimeout = null;
        this._cmdr = null;
        this._data = {};
        extend(this, data);
    }

    track_overload(records_left = null) {

        if (records_left === null) {
            records_left = this._rec_left;
        }

        if (records_left && !this._overload) {
            UNI.emitf(EV_NET, this._id, 'overload', true);
            this._overload = true;
        }

        if (records_left === 0) {
            if (this._overtimeout) {
                clearTimeout(this._overtimeout);
                this._overtimeout = null;
            }
            //re-fill timeout
            this._overtimeout = setTimeout(() => {
                if (this._rec_left && this._overload) return;
                if (this._overload && !this._rec_left) {
                    this._overload = false;
                    UNI.emit(EV_NET, this._id, 'overload', false);
                    UNI.refill_user(this._id);

                    clearTimeout(this._overtimeout);
                    this._overtimeout = null;
                }
            }, 800);
        }
        this._rec_left = records_left;
    }

    async init() {
        if (this.cmdr_name) this._cmdr = await UNI.get_cmdr(this._id, this.cmdr_name);
    }

    async set_cmdr(name) {
        if (!name) return;
        this._cmdr = await UNI.get_cmdr(this._id, name);
        this.cmdr_name = name;
        if (!this.cmdrs.includes(name)) {
            this.cmdrs.push(name);
            await this._cmdr.journal_index();
        }
        this._ch = true;
        UNI.emit(EV_NET, this._id, 'user', this.data());
        UNI.emit(EV_NET, this._id, 'cmdr', this._cmdr.data());
    }

    touch(data = null) {
        if (data) extend(this, data);
        this._ch = true;
    }

    data() {
        return tools.pickx(this, this._data,
            ['email', 'email'],
            ['api_key', 'api_key'],
            ['last_rec', 'last_rec'],
            ['cmdrs', 'cmdrs'],
            ['online', 'online'],
            ['dev', 'dev'],
            ['valid', 'valid'],
        );
    }

    async save() {
        if (!this._ch) return;

        let snapshot = {};

        for (let p in this)
            if (p[0] !== '_' || p === '_id') snapshot[p] = this[p];

        await DB.users.save(snapshot);
        this._ch = false;
    }


}