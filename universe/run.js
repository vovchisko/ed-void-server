const extend = require('deep-extend');
const clog = require('../clog');
const tools = require('./tools');

let UNI;
let DB;

/**
 * init RUN module
 * @param uni {Universe}
 * @param db {Database}
 * @returns {RUN}
 */
module.exports.init = function (uni, db) {
    UNI = uni;
    DB = db;
    return RUN;
};

class RUN {
    constructor(track, cmdr) {
        this._id = DB.gen_id(); //we should always have new ID but it will be saved only at end of run
        this.track_id = track._id;
        this.status = 0; // 0 - preparation, 1 - in progress, 2 - complete
        this.name = track.name;
        this.cmdrs = {}; // records about racers/cmdrs to save
        this.host_cmdr = cmdr._id;
        this.host_cmdr_name = cmdr.name;
        this.points = [];
        track.points.forEach(p => {this.points.push(extend({}, p))});
        this._heart = setInterval(() => {this.tick()}, 5000);

    }

    tick() {
        console.log('run tick: ', this);
    }

    join(cmdr) {
        if (cmdr.run_id) return clog('cmdr already busy with run ' + cmdr.name + ' / run_id: ' + cmdr.run_id);
        this.cmdrs[cmdr._id] = {id: cmdr._id, name: cmdr.name, point: 0};
        cmdr.touch({run_id: this._id});
        cmdr.dest_set(extend({r: 1000}, this.points[0]), '/RUN:' + this._id); // todo: sometimes R not defined and cause errors
        console.log('dest:', this.points[0]);
    }

    info() {
        return {
            name: this.name,
            pilots: this.cmdrs,
        }
    }

    async save() {
        //no temporary fields here...
        await DB.systems.save(this);
    }
}
