const extend = require('deep-extend');
const clog = require('../clog');
const tools = require('./tools');

let UNI;
let DB;

global.RUN_COUNTDOWN = 5;

global.RUNNER = {
    JOINED: 'pending',
    READY: 'ready',
    IN: 'in-run',
    DEAD: 'dead',
    LEAVE: 'leave',
    FINISHED: 'finished',
    DISQILFIED: 'disquilified',
};

global.RUNST = {
    SETUP: 'setup',
    RUNNING: 'running',
    COMPLETE: 'complete',
    CLOSED: 'closed',
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
        this._track = track; // temp
        this.status = RUNST.SETUP; // 0 - preparation, 1 - in progress, 2 - complete
        this.name = track.name;
        this.c_down = null; // secodns/ticks
        this.pilots = {}; // see join() for details
        this.host = cmdr._id;
        this.loc = this._track.points[0];
        this._heart = setInterval(() => {this.tick()}, 1000); // temp

        UNI.runs[this._id] = this;
        UNI.runs[this._id].pilot_join(cmdr);
    }

    broadcast_status() {
        UNI.broadcast('run-status', this.info());
    }

    tick() {
        if (this.status === RUNST.SETUP) {
            if (this.is_all(RUNNER.READY)) {
                if (this.c_down === null) this.c_down = RUN_COUNTDOWN + 1;
                if (this.c_down <= 0) return this.start();
                this.c_down--;
                this.broadcast_status();
                this.broadcast();
            } else {
                if (this.c_down !== null) {
                    this.c_down = null;
                    this.broadcast();
                    this.broadcast_status();
                }
            }
        }

        if (this.status === RUNST.RUNNING) {
            if (!this.has_any(RUNNER.IN)) return this.complete();
        }

        if (this.status === RUNST.COMPLETE) {
            for (let i in this.pilots)
                if (this.pilots[i].w) return;
            this.close();
        }

        //can be removed later
        let log = extend({}, this);
        delete log._heart;
        delete log._track;
        console.log(log);

    }

    async start() {
        this.status = RUNST.RUNNING;
        this.broadcast_status();

        for (let i in this.pilots) {
            await UNI.get_user({_id: this.pilots[i].uid})
                .then((user) => {
                    if (user && user._cmdr) this.update(user._cmdr);
                })
                .catch((e) => {console.log('RUN:START ERROR - unable to find pilot', e)});
        }
        this.broadcast();

    }

    update(cmdr) {
        if (!this.pilots[cmdr._id]) return;

        let pilot = this.pilots[cmdr._id];

        pilot.sys_id = cmdr.sys_id;
        pilot.body_id = cmdr.body_id;
        pilot.st_id = cmdr.st_id;
        pilot.starpos = cmdr.starpos;
        pilot.x = cmdr.dest.x;

        if (this.status === RUNST.SETUP) {
            if (pilot.x !== 0) pilot.status = RUNNER.JOINED; //TODO: TEST when user leave start point after ready state!
            this.broadcast(cmdr._id);
            return;
        }

        if (cmdr.dest.x === 0) {
            if (cmdr.dest.goal === DGOAL.SURFACE && cmdr.status.alt) pilot.score += Math.floor(9000 / cmdr.status.alt);
            if (cmdr.dest.goal === DGOAL.STATION) pilot.score += 2000;
            if (cmdr.dest.goal === DGOAL.BODY) pilot.score += 3000;
            if (cmdr.dest.goal === DGOAL.SYSTEM) pilot.score += 1000;
            pilot.score += 200;
            pilot.t = Date.now();
            pilot.p++;

            if (this._track.points[pilot.p]) {
                //next checkpoint
                cmdr.dest_set(extend({r: 1000}, this._track.points[pilot.p]), '/RUN:' + pilot.p);
            } else {
                pilot.status = RUNNER.FINISHED;
                cmdr.void_run.total++;
                cmdr.void_run.score += pilot.score;
                cmdr.touch({});
                cmdr.dest_clear();
            }
        }
        this.re_arrange(); //<< maybe that's the problem
        this.broadcast(cmdr._id);

    }

    re_broadcast_for(cmdr) {
        UNI.emitf(EV_NET, cmdr.uid, 'run-upd', this.info());
    }

    re_arrange() {
        let chart = [];
        for (let i in this.pilots) {
            chart.push({
                _id: i,
                order: this.pilots[i].p - (1 * ('0.' + this.pilots[i].t)) //checkpoint minus fraction time (less time minused - higher position)
            });
        }

        chart.sort((a, b) => b.order - a.order);

        for (let i = 0; i < chart.length; i++) {
            this.pilots[chart[i]._id].pos = i + 1;
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

    pilot_ready(cmdr, state) {
        this.pilots[cmdr._id].status = state ? RUNNER.READY : RUNNER.JOINED;
        this.update(cmdr);
    }

    is_all(status) {
        for (let i in this.pilots)
            if (this.pilots[i].status !== status) return false;
        return true;
    }

    has_any(status) {
        for (let i in this.pilots)
            if (this.pilots[i].status === status) return true;
        return false;
    }

    pilot_leave(cmdr) {
        let pilot = this.pilots[cmdr._id];

        cmdr.run_id = null;
        cmdr.dest_clear();
        pilot.w = 0;

        if (this.status === RUNST.SETUP) {
            delete this.pilots[cmdr._id];
        }

        if (this.status === RUNST.RUNNING) {
            pilot.status = RUNNER.LEAVE; // that's it.
            cmdr.void_run.total++;
        }

        if (this.status === RUNST.COMPLETE) {
            //todo: win? what to do?
        }

        cmdr.touch({});

        this.re_arrange();
        this.broadcast();
        if (this.status === RUNST.SETUP) this.broadcast_status();

        if (!this.pilots_count()) {
            this.close();
            this.broadcast_status();
        }
    }

    pilots_count() {
        let c = 0;
        for (let i in this.pilots) c++;
        return c;
    }

    complete() {
        this.status = RUNST.COMPLETE;
        this.broadcast();
    }

    async close() {
        for (let i  in this.pilots) {
            let user = await UNI.get_user(this.pilots[i].uid);
            this.pilot_leave(user._cmdr);
        }
        clearInterval(this._heart);
        this.status = RUNST.CLOSED;

        delete UNI.runs[this._id];
        delete this._track;
        delete this._heart;

        if (this.pilots_count())
            await DB.run_races.save(this);
    }


    pilot_join(cmdr) {

        if (cmdr.run_id) return clog('cmdr already busy with run ' + cmdr.name + ' / run_id: ' + cmdr.run_id);
        if (this.status !== RUNST.SETUP) return UNI.emitf(EV_NET, cmdr.uid, 'alert', {text: 'race already started'});

        this.pilots[cmdr._id] = {
            _id: cmdr._id,//cmdr cmdr_id
            p: 0, //current point ID
            pos: 0, // position in race
            status: RUNNER.JOINED, // current status in-race
            uid: cmdr.uid,
            score: 0,
            sys_id: cmdr.sys_id,
            body_id: cmdr.body_id,
            st_id: cmdr.st_id,
            ord: 0, // int=p + dec = date.now or last p
            w: 1, // watching?
        };

        cmdr.touch({run_id: this._id});
        cmdr.dest_set(extend({r: 1000}, this._track.points[0]), '/RUN:0');

        clog(`RUN: CMDR ${cmdr._id} (${cmdr.name}) joined the race ${this._id}`);

        this.re_arrange();
        this.broadcast();
        this.broadcast_status();
    }


    info() {
        return {
            _id: this._id,
            track_id: this.track_id,
            name: this.name,
            host: this.host,
            pilots: this.pilots,
            status: this.status,
            c_down: this.c_down,
            loc: this.loc,
        }
    }

}
