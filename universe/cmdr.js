const extend = require('deep-extend');
const clog = require('../clog');
const tools = require('./tools');

let UNI;
let DB;


/**
 * init CMDR module
 * @param uni {Universe}
 * @param db {Database}
 * @returns {CMDR}
 */
module.exports.init = function (uni, db) {
    UNI = uni;
    DB = db;
    return CMDR;
};

class CMDR {
    constructor(cmdr_data) {
        this._id = null;
        this._ch = true;
        this.uid = null;
        this.name = null;
        this.last_rec = new Date(0);
        this.sys_id = null;
        this.body_id = null;
        this.starpos = [0, 0, 0];
        this.metrics = {curr_ds: 0};
        this.status = {
            flags: 0,
            pips: [0, 0, 0],
            fgroup: 0,
            lat: null,
            lon: null,
            alt: null,
            head: null,
        };
        this.dest = {
            enabled: false,
            goal: null,
            sys_id: null,
            body_id: null,
            st_id: null,
            lat: null,
            lon: null,
            r: null,
            head: null,
            f: '',
            done: false,
        };
        this._exp = null;
        this._data = {};

        extend(this, cmdr_data);
        this.journal_id = `${this.uid}/${DB.shash(this.name)}`;
    }

    async dest_set(d, flag = '') {

        this.dest_clear();
        this.dest.f = flag;

        if (!d) {
            this.dest.f = '/CLR';
            this.dest.enabled = false;
            UNI.emitf(EV_NET, this.uid, 'dest-set', this.dest);
            return;
        }

        switch (d.goal) {
            case DEST_GOAL.SURFACE:
                this.dest.goal = d.goal;

                let body = d.body_id ? await UNI.get_body(d.body_id) : null;
                if (body) {
                    this.dest.body_id = body._id;
                    this.dest.sys_id = body.sys_id;

                    if (body.radius) {
                        this.dest.r = body.radius / 1000;
                        this.dest.enabled = true; //success
                    } else {
                        this.dest.f += '/WA-CR';
                        if (!d.r) {
                            this.dest.r = 1000;
                            this.dest.f += '/ER-UR';
                        } else {
                            this.dest.r = parseInt(d.r);
                            this.dest.enabled = true; //success
                        }
                    }
                } else {
                    this.dest.f += '/ER-BODY';
                }
                this.dest.lat = parseFloat(d.lat) || 0;
                this.dest.lon = parseFloat(d.lon) || 0;

                break;

            case DEST_GOAL.STATION:
                this.dest.goal = d.goal;
                let st = d.st_id ? await UNI.get_station(d.st_id) : null;
                if (st) {
                    this.dest.st_id = st._id;
                    this.dest.sys_id = st.sys_id;
                    this.dest.enabled = true; //success
                } else {
                    this.dest.f += '/ER-ST';
                }

                break;

            case DEST_GOAL.SYSTEM:
                this.dest.goal = d.goal;
                let sys = d.sys_id ? await UNI.get_system(d.sys_id) : null;
                if (sys) {
                    this.dest.sys_id = sys._id;
                    this.dest.enabled = true; //success
                } else {
                    this.dest.f += '/ER-SYS';
                }

                break;

            default:
        }


        this.dest_calc();

        UNI.emitf(EV_NET, this.uid, 'dest-set', this.dest);

    }

    dest_calc() {
        if(!this.dest.enabled) return false;

        if (this.dest.sys_id && this.dest.sys_id !== this.sys_id) {
            //todo: something here...
        }

        if (this.dest.goal === DEST_GOAL.SURFACE) {
            if (this.dest.enabled) {
                if (this.status.alt === null) return;
                let latStart = this.status.lat * Math.PI / 180;
                let lonStart = this.status.lon * Math.PI / 180;
                let latDest = this.dest.lat * Math.PI / 180;
                let lonDest = this.dest.lon * Math.PI / 180;
                let deltaLon = lonDest - lonStart;
                let deltaLat = Math.log(Math.tan(Math.PI / 4 + latDest / 2) / Math.tan(Math.PI / 4 + latStart / 2));
                let initialBearing = (Math.atan2(deltaLon, deltaLat)) * (180 / Math.PI);
                if (initialBearing < 0) initialBearing = 360 + initialBearing;
                this.dest.dist = Math.acos(Math.sin(latStart) * Math.sin(latDest) + Math.cos(latStart) * Math.cos(latDest) * Math.cos(deltaLon)) * (this.dest.r);
                this.dest.head = Math.floor(initialBearing);
                if (isNaN(this.dest.head)) this.dest.head = 'ERR';
                UNI.emitf(EV_NET, this.uid, 'dest', tools.not_nulled(this.dest));
            }
        }

    }

    dest_clear() {
        this.dest = {
            enabled: false,
        };
    }

    journal() {
        return DB.journal(`${this.uid}/${DB.shash(this.name)}`);
    }

    journal_index() {
        return DB.journal_index(`${this.uid}/${DB.shash(this.name)}`);
    }

    async init() {
        let exp = await DB.exp_data.findOne({_id: this._id});
        if (!exp) {
            this._exp = new EXP_DATA({_id: this._id});
        } else {
            this._exp = new EXP_DATA(exp);
        }
    }

    current_system_name() {
        if (!this.sys_id) return 'unknown';
        return this.sys_id.split('@')[0];
    }

    __reset() {
        this.sys_id = null;
        this.body_id = null;
        this.starpos = [0, 0, 0];
        this.metrics.curr_ds = 0;
        this.status = {};
        this._exp.reset();
    }

    touch(data = null) {
        if (data) extend(this, data);
        this._ch = true;
        if (this.uid) UNI.emit(EV_NET, this.uid, 'cmdr', this.data());
    }

    data() {
        return tools.pickx(this, this._data,
            ['name', 'name'],
            ['last_rec', 'last_rec'],
            ['sys_id', 'sys_id'],
            ['body_id', 'body_id'],
            ['starpos', 'starpos'],
            ['metrics', 'metrics'],
        );
    }

    async save() {
        this._exp.save();
        if (!this._ch) return;
        if (!this._id || !this.uid) return;
        let snapshot = {};
        for (let p in this)
            if (p[0] !== '_' || p === '_id') snapshot[p] = this[p];
        await DB.cmdrs.save(snapshot);
        this._ch = false;
    }
}


class EXP_DATA {
    constructor(exp_data) {
        this._id = null;
        this._ch = true;
        this.total = 0;
        this.sys_count = 0;
        this.summ = {p: 0, s: 0, c: 0,};
        this.systems = {};

        extend(this, exp_data)
    }

    reset() {
        this.total = 0;
        this.sys_count = 0;
        this.summ = {p: 0, s: 0, c: 0,};
        this.systems = {};
        this._ch = true;
    }

    async exp_data_add(rec, c_sys_id) {

        let scan_type = tools.scan_obj_type(rec);

        if (!scan_type) return;

        //get current system in lower case
        let sys_name = c_sys_id.split('@')[0];
        let body_name = tools.convert.LOW_CASE(rec.BodyName).replace(sys_name, '').trim();
        if (!body_name) body_name = '*';

        if (!this.systems[sys_name]) this.systems[sys_name] = {upd: 0, bodies: {}};
        this.systems[sys_name].upd = Date.now();

        this.systems[sys_name].bodies[body_name] = {t: scan_type[0], v: tools.estimate_scan(rec)};

        this.calc();

        this._ch = true;
    }

    get_exp_data(detailed = false, curr_system_name = undefined) {
        this.calc();

        return {
            total: this.total,
            sys_count: this.sys_count,
            summ: this.summ,
            systems: detailed ? this.systems : undefined,
            curr_system: curr_system_name ? this.systems[curr_system_name] : undefined
        }
    }

    async exp_data_sell(cmdr, rec) {

        for (let i in rec.Systems) {
            let sys = tools.convert.LOW_CASE(rec.Systems[i]);
            delete this.systems[sys];
        }

        if (rec.Discovered)
            for (let i = 0; i < rec.Discovered.length; i++) {
                let b_name = tools.convert.LOW_CASE(rec.Discovered[i]);
                await DB.exp_discovered.save({_id: b_name, cmdr: cmdr.name});
            }

        this.calc();

        this._ch = true;
        await this.save();
    }

    calc() {
        this.total = 0;
        this.sys_count = 0;

        for (let i in this.summ) {
            this.summ[i] = 0;
        }

        for (let s in this.systems) {
            this.sys_count++;
            for (let b in this.systems[s].bodies) {
                this.total += this.systems[s].bodies[b].v;
                this.summ[this.systems[s].bodies[b].t]++;
            }
        }
    }

    async save() {
        if (!this._ch) return;
        let snapshot = {};
        for (let p in this) if (p[0] !== '_' || p === '_id') snapshot[p] = this[p];
        await DB.exp_data.save(snapshot);
        this._ch = false;
    }
}

