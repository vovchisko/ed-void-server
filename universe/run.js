const extend = require('deep-extend');
const clog = require('../clog');
const tools = require('./tools');

let UNI;
let DB;

global.RUNNER = {
    JOINED: 'joined',
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
        this.status = RUNST.SETUP; // 0 - preparation, 1 - in progress, 2 - complete
        this.name = track.name;
        this.c_down = 11; // secodns/ticks
        this.pilots = []; // see join() for details
        this.cmdr_id = cmdr._id;
        this.cmdr_name = cmdr.name;
        this._track = track;
        this._heart = setInterval(() => {this.tick()}, 1000);
    }

    broadcast_status() {
        UNI.broadcast('run-status', this.info());
    }

    tick() {
        if (this.status === RUNST.SETUP) {
            if (this.is_all(RUNNER.READY)) {
                this.c_down--;
                if (this.c_down <= 0) return this.start();
                this.broadcast_status();
                this.broadcast();
            } else {
                if (this.c_down !== 11) {
                    this.c_down = 11;
                    this.broadcast();
                    this.broadcast_status();
                }
            }
        }

        if (this.status === RUNST.RUNNING) {
            if (!this.has_any(RUNNER.IN)) return this.complete();
        }

        if (this.status === RUNST.COMPLETE) {
            if (!this.pilots.length) { this.close() }
        }


        //can be removed later
        let log = extend({}, this);
        delete log._heart;
        delete log._track;
        console.log(log)

    }

    start() {
        this.status = RUNST.RUNNING;
        for (let i = 0; i < this.pilots.length; i++) {
            UNI.get_user({_id: this.pilots[i].uid})
                .then((user) => {
                    if (user && user._cmdr) this.update(user._cmdr);
                })
                .catch((e) => {console.log('RUN:START ERROR - unable to find pilot', e)});
        }
        this.broadcast();
        this.broadcast_status();
    }

    update(cmdr) {
        tools.item_in(this.pilots, '_id', cmdr._id, (pilot, key) => {
            console.log(">>> ", pilot, key);
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

                pilot.c_point++;
                pilot.p = pilot.c_point + 1 * ('0.' + Date.now()); // sort user by this value.

                if (this._track.points[pilot.c_point]) {
                    //next checkpoint
                    cmdr.dest_set(extend({r: 1000}, this._track.points[pilot.c_point]), '/RUN:' + pilot.c_point);
                } else {
                    pilot.status = RUNNER.FINISHED;
                    cmdr.void_run.total++;
                    cmdr.void_run.score += pilot.score;
                    cmdr.touch({});
                    cmdr.dest_clear();
                }
            }
            this.re_arrange();
            this.broadcast(cmdr._id);
        });
    }

    re_broadcast_for(cmdr) {
        tools.item_in(this.pilots, '_id', cmdr._id, (pilot, key) => {
            UNI.emitf(EV_NET, cmdr.uid, 'run-upd', this.info());
        });
    }

    re_arrange() {
        this.pilots.sort((a, b) => b.p - a.p);
        for (let i = 0; i < this.pilots.length; i++) {
            this.pilots[i].pos = i + 1;
        }
    }

    broadcast(cmdr_id = null) {
        for (let i in this.pilots) {
            if (!cmdr_id) {
                UNI.emitf(EV_NET, this.pilots[i].uid, 'run-upd', this.info());
            } else {
                UNI.emitf(EV_NET, this.pilots[i].uid, 'run-upd-cmdr', tools.item_in(this.pilots, '_id', cmdr_id));
            }
        }
    }

    pilot_ready(cmdr) {
        tools.item_in(this.pilots, '_id', cmdr._id, (pilot, key) => {
            pilot.status = RUNNER.READY;
            this.update(cmdr);
        });
    }

    is_all(status) {
        for (let i = 0; i < this.pilots.length; i++)
            if (this.pilots[i].status !== status) return false;
        return true;
    }

    has_any(status) {
        for (let i = 0; i < this.pilots.length; i++)
            if (this.pilots[i].status === status) return true;
        return false;
    }

    leave(cmdr) {
        console.log('>>> LEAVE?');
        tools.item_in(this.pilots, '_id', cmdr._id, (pilot, key) => {
            console.log('>>> LEAVE!');
            cmdr.run_id = null;
            cmdr.dest_clear();

            if (this.status === RUNST.SETUP) {
                this.pilots.splice(key, 1);
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
            this.broadcast_status();
        });


    }

    complete() {
        this.status = RUNST.COMPLETE;
        this.broadcast();
        this.broadcast_status();
        console.log('---- RACE COMPLETE ----');
    }

    async close() {
        for (let i = 0; i < this.pilots.length; i++) {
            let user = await UNI.get_user(this.pilots[i].uid);
            this.leave(user._cmdr);
        }
        clearInterval(this._heart);
        this.broadcast_status();
        delete UNI.runs[this._id];

        clog('>>> RUN COMPLETE!')
    }


    join(cmdr) {
        if (cmdr.run_id) return clog('cmdr already busy with run ' + cmdr.name + ' / run_id: ' + cmdr.run_id);
        if (this.status !== RUNST.SETUP) return UNI.emitf(EV_NET, cmdr.uid, 'alert', {text: 'race already started'});

        this.pilots.push({
            _id: cmdr._id,//cmdr cmdr_id
            name: cmdr.name, //cmdr name
            c_point: 0, //current point ID
            pos: 0, // position in race
            status: RUNNER.JOINED, // current status in-race
            uid: cmdr.uid,
            score: 0,
            sys_id: cmdr.sys_id,
            body_id: cmdr.body_id,
            st_id: cmdr.st_id,
            p: 0, // int=c_point + dec = date.now or last c_point
        });

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
            //track_id: this.track_id,
            name: this.name,
            cmdr_name: this.cmdr_name,
            //cmdr_id: this.cmdr_id,
            pilots: this.pilots,
            status: this.status,
            c_down: this.c_down,
            //points: this._track.points,
        }
    }

    async save() {
        //no temporary fields here...
        await DB.systems.save(this);
    }
}
