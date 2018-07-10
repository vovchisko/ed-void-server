const extend = require('deep-extend');
const clog = require('../clog');
const tools = require('./tools');

let UNI;
let DB;

/**
 * init STATION module
 * @param uni {Universe}
 * @param db {Database}
 * @returns {STATION}
 */
module.exports.init = function (uni, db) {
    UNI = uni;
    DB = db;
    return STATION;
};

class STATION {
    constructor(station) {
        this._id = null;
        this.name = null;
        this.submited = null;
        this.upd = 0;
        extend(this, station);
    }

    append(cmdr, rec) {

        tools.pickx(rec, this,
            ['SystemAddress', 'sys_addr'],
            ['MarketID', 'market_id'],
            ['StationFaction', 'faction'],
            ['FactionState', 'faction_state'],
            ['StationGovernment', 'goverment'],
            ['StationAllegiance', 'allegiance'],
            ['StationServices', 'services'],
            ['StationEconomy', 'economy'],
            ['StationType', 'type', tools.convert.LOW_CASE],
            ['StationEconomies', 'economies', (ecs) => {
                if (!ecs) return null;
                let e = {};
                for (let i = 0; i < ecs.length; i++) e['Name'] = 'Proportion';
                return e;
            }],
            ['DistFromStarLS', 'arrival'],
        );

        this.sys_id = cmdr.sys_id;
        this.starpos = cmdr.starpos.map(x => x);

        if (!this.submited) this.submited = cmdr.name;
        if (this.upd < rec.timestamp) this.upd = rec.timestamp;

        return this.save();
    }


    async save() {
        //no temporary fields here...
        await DB.stations.save(this);
    }
}



