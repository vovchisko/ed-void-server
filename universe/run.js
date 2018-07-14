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
        this.pilots = {/* id, name, point_id */};

        this.cmdr_id = cmdr._id;
        this.cmdr_name = cmdr.name;

        this.points = [];
        track.points.forEach(p => {this.points.push(extend({}, p))});
        this._heart = setInterval(() => {this.tick()}, 2000);

        this._listener = null;

    }

    tick() {
        console.log('race tick... AND ADD FAKE UPDATE BUTTON WITH x=0 ON UI SO YOU CAN TEST ALL THE THINGS>');
    }

    update(cmdr) {
        if (cmdr.dest.x === 0) {
            this.pilots[cmdr._id].pid++;
            if (this.points[this.pilots[cmdr._id].pid]) {
                cmdr.dest_set(extend({r: 1000}, this.points[this.pilots[cmdr._id].pid]), '/RUN');
            } else {
                this.pilots[cmdr._id].pid = -1;
                cmdr.dest_clear();
            }
        }

        this.broadcast();
    }

    broadcast(about_cmdr = null) {
        if (!about_cmdr) {
            //broadcast all race status for everyone
        } else {
            //broadcast specified cmdr update
        }

    }

    start() {

    }

    join(cmdr) {
        if (cmdr.run_id) return clog('cmdr already busy with run ' + cmdr.name + ' / run_id: ' + cmdr.run_id);
        this.pilots[cmdr._id] = {
            id: cmdr._id,
            name: cmdr.name,
            pid: 0
        };

        cmdr.touch({run_id: this._id});
        cmdr.dest_set(extend({r: 1000}, this.points[0]), '/RUN');

        clog(`RUN: CMDR ${cmdr._id} (${cmdr.name}) joined the race ${this._id}`);
    }


    info() {
        return {
            name: this.name,
            pilots: this.pilots,
            cmdr_name: this.cmdr_name,
            cmdr_id: this.cmdr_id,
        }
    }

    stop() {
        //party is over
    }

    async save() {
        //no temporary fields here...
        await DB.systems.save(this);
    }
}
