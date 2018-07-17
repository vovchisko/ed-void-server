const extend = require('deep-extend');
const clog = require('../clog');
const tools = require('./tools');

let UNI;
let DB;

global.RUNNER = {
    IN: 'in-run',
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
        this._heart = setInterval(() => {this.tick()}, 3000);
        this._chart = [];
    }

    tick() {
        let log = extend({}, this);
        delete log.points;
        delete log._heart;
        delete log.pilots;
        console.log('RACE', log);
    }

    update(cmdr) {

        let pilot = this.pilots[cmdr._id];

        pilot.sys_id = cmdr.sys_id;
        pilot.body_id = cmdr.body_id;
        pilot.st_id = cmdr.st_id;
        pilot.starpos = cmdr.starpos;
        pilot.x = cmdr.dest.x;

        if (this.status === 0) {
            this.broadcast(cmdr._id);
            return;
        }

        //what we gonna do with clusters btw?

        if (cmdr.dest.x === 0) {
            //score?
            if (cmdr.dest.goal === DGOAL.SURFACE && cmdr.status.alt) pilot.score += Math.floor(9000 / cmdr.status.alt);
            if (cmdr.dest.goal === DGOAL.STATION) pilot.score += 2000;
            if (cmdr.dest.goal === DGOAL.BODY) pilot.score += 3000;
            if (cmdr.dest.goal === DGOAL.SYSTEM) pilot.score += 1000;

            pilot.score += 200; //always

            //next point setup
            pilot.c_point++;
            pilot.p = pilot.c_point + 1 * ('0.' + Date.now());
            if (this.points[pilot.c_point]) {
                cmdr.dest_set(extend({r: 1000}, this.points[pilot.c_point]), '/RUN:' + pilot.c_point);
            } else {
                pilot.status = RUNNER.FINISHED;
                cmdr.dest_clear();
                if (!this.has_active_pilots()) { this.complete(); }
            }
        }
        this.re_arrange();
        this.broadcast(cmdr._id);
    }

    re_broadcast_for(cmdr) {
        if (this.pilots[cmdr._id]) UNI.emitf(EV_NET, cmdr.uid, 'run-upd', this.info());
    }

    re_arrange() {
        this._chart.splice(0, this._chart.length);
        for (let i in this.pilots) {
            this._chart.push({id: this.pilots[i].id, p: this.pilots[i].p});
        }
        this._chart.sort((a, b) => b.p - a.p);
        for (let i = 0; i < this._chart.length; i++) {
            this.pilots[this._chart[i].id].pos = i + 1;
        }
    }

    broadcast(cmdr_id = null) {
        for (let i in this.pilots) {
            if (!cmdr_id) {
                UNI.emitf(EV_NET, this.pilots[i].uid, 'run-upd', this.info());
            } else {
                UNI.emitf(EV_NET, this.pilots[i].uid, 'run-upd-cmdr', this.pilots[cmdr_id]);
            }
        }
    }

    start(cmdr) {
        if (cmdr._id !== this.cmdr_id) return;

        this.status = 1;

        this.broadcast();
        for (let i in this.pilots) {
            UNI.get_user({_id: this.pilots[i].uid})
                .then((user) => {
                    if (user && user._cmdr) this.update(user._cmdr);
                }).catch((e) => {console.log('RUN:START ERROR - unable to find pilot', e)});
        }
    }

    leave(cmdr) {
        if (this.pilots[cmdr._id]) {
            cmdr.run_id = null;
            cmdr.dest_clear();
            if (this.status === 1) {
                this.pilots[cmdr._id].status = RUNNER.LEAVE; // that's it.
                cmdr.void_run.total++;
            }

            if (this.status === 0) {
                delete this.pilots[cmdr._id];
            }

            if (this.status === 2) {
                cmdr.void_run.total++;
                cmdr.void_run.score += this.pilots[cmdr._id].score;
                //todo: win?
            }
            cmdr.touch({});
        }

        if (!this.has_active_pilots())
            return this.complete();

        this.broadcast();
    }

    complete(force = false) {
        this.status = 2;
        this.broadcast();
        console.log('---- RACE COMPLETE ---- //todo: save?');
        this.close();
    }

    async close() {
        for (let i in this.pilots) {
            let cmdr = await UNI.get_user(this.pilots[i].uid);
            this.leave(cmdr);
        }
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
            score: 0,
            sys_id: cmdr.sys_id,
            body_id: cmdr.body_id,
            st_id: cmdr.st_id,
            p: 0, // int=c_point + dec = date.now or last c_point
        };

        cmdr.touch({run_id: this._id});
        cmdr.dest_set(extend({r: 1000}, this.points[this.pilots[cmdr._id].c_point]), '/RUN:0');

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
