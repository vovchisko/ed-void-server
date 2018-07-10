const extend = require('deep-extend');
const clog = require('../clog');
const tools = require('./tools');

let UNI;
let DB;

/**
 * init SYSTEM module
 * @param uni {Universe}
 * @param db {Database}
 * @returns {SYSTEM}
 */
module.exports.init = function (uni, db) {
    UNI = uni;
    DB = db;
    return SYSTEM;
};

class SYSTEM {
    constructor(sys) {
        this._id = null;
        this.name = null;
        this.submited = null;
        this.upd = 0;
        this.ds_count = 0;
        extend(this, sys);
    }

    append(cmdr, rec) {
        tools.pickx(rec, this,
            ['StarSystem', 'name', tools.convert.LOW_CASE],
            ['StarSystem', 'name_raw'],
            ['StarPos', 'starpos', arr => arr.map((x) => {return Math.floor(x * 32)})],
            ['SystemSecurity', 'security'],
            ['SystemEconomy', 'economy'],
            ['Population', 'population'],
            ['SystemAllegiance', 'allegiance'],
            ['SystemGovernment', 'government'],
            ['SystemFaction', 'faction'],
        );

        if (rec.Factions) {
            this.factions = [];
            for (let i in rec.Factions) {
                let fa = {};
                tools.pickx(rec.Factions[i], fa,
                    ['Name', 'name'],
                    ['FactionState', 'state'],
                    ['Government', 'gov'],
                    ['Influence', 'influence'],
                    ['Allegiance', 'allegiance'],
                    ['PendingStates', 'state_pending'],
                    ['RecoveringStates', 'state_recovering'],
                );
                this.factions.push(fa);
            }
        }


        if (!this.submited) this.submited = cmdr.name;
        if (this.upd < rec.timestamp) this.upd = rec.timestamp;

        return this.save();
    }


    async save() {
        //no temporary fields here...
        await DB.systems.save(this);
    }
}

