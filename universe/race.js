const extend = require('deep-extend');
const clog = require('../clog');
const tools = require('./tools');

let UNI;
let DB;

/**
 * init RACE module
 * @param uni {Universe}
 * @param db {Database}
 * @returns {RACE}
 */
module.exports.init = function (uni, db) {
    UNI = uni;
    DB = db;
    return RACE;
};

class RACE {
    constructor(track_id, cmdr) {
        this._id = null;
        this.name = null;
        this.checks = [];
        this.cmdrs = {};
        extend(this, race);
    }

    instance(cmdr){
        //create instance of race with cmdr joined
    }

    async save() {
        //no temporary fields here...
        await DB.systems.save(this);
    }
}

class RACE_INST {

}