const extend = require('deep-extend');
const clog = require('../clog');
const tools = require('./tools');

let UNI;
let DB;

global.RUNNER = {
    IN: 'in-game',
    DEAD: 'dead',
    LEAVE: 'leave',
    FINISHED: 'finished',
    DISQILFIED: 'disquilified',
};

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
        this.pilots = {}; // see join() for details
        this.cmdr_id = cmdr._id;
        this.cmdr_name = cmdr.name;
        this.points = [];
        track.points.forEach(p => {this.points.push(extend({}, p))});
        this._heart = setInterval(() => {this.tick()}, 1000);
    }

    tick() {
        console.log('race tick...');
    }

    update(cmdr) {
        if (cmdr.dest.x === 0) {
            this.pilots[cmdr._id].c_point++;
            if (this.points[this.pilots[cmdr._id].c_point]) {
                cmdr.dest_set(extend({r: 1000}, this.points[this.pilots[cmdr._id].c_point]), '/RUN');
            } else {
                this.pilots[cmdr._id].c_point = -1;
                this.pilots[cmdr._id].status = RUNNER.FINISHED;
                cmdr.dest_clear();

                //todo: can we complete run ?
            }
        }
        this.broadcast(cmdr._id);
    }

    re_broadcast_for(cmdr) {
        if (this.pilots[cmdr._id])
            UNI.emitf(EV_NET, cmdr.uid, 'run-upd', this.info());

    }

    broadcast(cmdr_id = null, to_cmdr = null) {
        for (let i in this.pilots) {
            if (!cmdr_id) {
                UNI.emitf(EV_NET, this.pilots[i].uid, 'run-upd', this.info());
            } else {
                UNI.emitf(EV_NET, this.pilots[i].uid, 'run-upd-cmdr', this.pilots[cmdr_id]);
            }
        }
    }

    start() {
        this.status = 1;
    }

    leave(cmdr) {
        if (this.pilots[cmdr._id]) {
            this.pilots[cmdr._id].status = RUNNER.LEAVE; // that's it.
            cmdr.dest_clear();
        }
        if (!this.has_active_pilots()) this.complete();

        this.broadcast();
    }

    complete(force = false) {
        // check who is finished
        // check who is leave
        this.status = 2;
        this.broadcast(); // broadcast changes
        // save records
        console.log('race complete...');
        clearInterval(this._heart);
        delete UNI.runs[this._id];
    }


    has_active_pilots() {
        for (let i in this.pilots)
            if (this.pilots[i].status === RUNNER.IN) return true;
        return false;
    }

    join(cmdr) {
        if (cmdr.run_id) return clog('cmdr already busy with run ' + cmdr.name + ' / run_id: ' + cmdr.run_id);
        this.pilots[cmdr._id] = {
            id: cmdr._id,//cmdr id
            name: cmdr.name, //cmdr name
            c_point: 0, //current point ID
            pos: 0, // position in race
            status: RUNNER.IN, // current status in-race
            uid: cmdr.uid,
        };

        cmdr.touch({run_id: this._id});
        cmdr.dest_set(extend({r: 1000}, this.points[this.pilots[cmdr._id].c_point]), '/RUN');

        clog(`RUN: CMDR ${cmdr._id} (${cmdr.name}) joined the race ${this._id}`);

        this.broadcast();
    }


    info() {
        return {
            _id: this._id,
            track_id: this.track_id,
            name: this.name,
            cmdr_name: this.cmdr_name,
            cmdr_id: this.cmdr_id,
            pilots: this.pilots,
            status: this.status,
            points: this.points,
        }
    }

    async save() {
        //no temporary fields here...
        await DB.systems.save(this);
    }
}
