'use strict';

// @link: https://ed.miggy.org/fd-journal-docs/
const dateformat = require('dateformat');
const EE3 = require('eventemitter3');
const extend = require('deep-extend');
const DB = require('./services/database');
const clog = require('../clog');
const tools = require('./tools');


global.DEST_GOAL = {
    SURFACE: 'surface',
    SYSTEM: 'system',
    STATION: 'station',
};


global.EV_PIPE = 'uni-pipe';
global.EV_NET = 'uni-data';
global.SEP_SYSTEM = '@';
global.SEP_BODY = '/';
global.SEP_COORD = ':';
global.FIRST_SYS_OBJ = '*';

class Universe extends EE3 {
    constructor() {
        super();
        this.users = {};
        this.cmdrs = {};
        this.users_api_key = {};
        clog('UNIVERSE: OK');
    }

    init() {
        if (GHOST) {
            clog('UNIVERSE IS A GHOST');
        } else {
            clog('UNIVERSE IS REAL & CAN BROADCAST');
        }
        if (!GHOST)
            this.autosave = setInterval(() => this.save_cache().catch(err => { clog('Autosave failed', err)}), 30000);
    }

    async save_cache() {
        for (let c in this.cmdrs) await this.cmdrs[c].save();
        for (let u in this.users) await this.users[u].save();
    }

    refill_user(uid) {
        return this.get_user({_id: uid})
            .then(async (user) => {
                if (!user) throw new Error();

                if (user._overload) {
                    user.track_overload();
                    UNI.emitf(EV_NET, user._id, 'overload', true);
                }

                this.emit(EV_NET, user._id, 'user', user.data());

                if (!user._cmdr) return;

                this.emit(EV_NET, user._id, 'cmdr', user._cmdr.data());
                this.emit(EV_NET, user._id, 'status', user._cmdr.status);

                let scans = user._cmdr.journal()
                    .find({event: {$in: ['Scan', 'FSDJump']}})
                    .sort({timestamp: -1})
                    .limit(16);


                scans.forEach((rec) => { this.emit(EV_PIPE, user._id, rec.event, rec) });

                if (user._cmdr.sys_id) {
                    let sys = await this.get_system(user._cmdr.sys_id);
                    this.emit(EV_NET, uid, 'c_system', sys);
                }

                if (user._cmdr.body_id) {
                    let body = await this.get_body(user._cmdr.body_id);
                    this.emit(EV_NET, uid, 'c_body', body);
                }

                if (user._cmdr.st_id) {
                    let st = await this.get_station(user._cmdr.st_id);
                    this.emit(EV_NET, uid, 'c_station', st);
                }

                this.emit(EV_NET, user._id, 'exp-data', user._cmdr._exp.get_exp_data(false, user._cmdr.current_system_name()));

                user._cmdr.dest_set(user._cmdr.dest);

                await this.repo_search(user, {uid: user._id});

            })
            .catch((e) => {
                clog(`UNI::refill_user(${uid}) - can't refill user;`, e);
            });
    }

    async upd_status(user, Status, cmdr_name, gv, lng) {

        //user.track_overload(0);

        if (user.cmdr_name !== cmdr_name) await user.set_cmdr(cmdr_name);

        extend(user._cmdr.status, {
            focus: Status.GuiFocus || null,
            flags: Status.Flags,
            pips: Status.Pips,
            fgroup: Status.FireGroup || 0,
            lat: typeof Status.Latitude !== 'undefined' ? parseFloat(Status.Latitude) : null,
            lon: typeof Status.Longitude !== 'undefined' ? parseFloat(Status.Longitude) : null,
            alt: typeof Status.Altitude !== 'undefined' ? parseFloat(Status.Altitude) : null,
            head: typeof Status.Heading !== 'undefined' ? parseFloat(Status.Heading) : null,
        });
        user._cmdr._ch = true; // but mark as changed
        if (user._cmdr.dest.enabled) user._cmdr.dest_calc();

        this.emit(EV_NET, user._id, 'status', user._cmdr.status);
    }

    /* ONLY FOR NEW RECORDS!! */
    async record(user, rec, cmdr_name, gv, lng, records_left = 0) {

        if (cmdr_name !== user.cmdr_name) await user.set_cmdr(cmdr_name);

        rec.timestamp = new Date(rec.timestamp);
        rec._lng = lng;
        rec._gv = gv;

        if (typeof rec._jp !== 'undefined' && typeof rec._jl !== 'undefined') {
            rec._id = rec.event + '/' + rec._jp + '+' + rec._jl;
            delete rec._jp;
            delete rec._jl;

            user.track_overload(records_left);

            this.emit(EV_PIPE, user._id, rec.event, rec);

            if (user._cmdr) await user._cmdr.journal().save(rec);

        } else if (typeof rec._data !== 'undefined') {
            if (['shipyard', 'market', 'outfitting'].includes(rec._data)) {
                rec._id = [dateformat(rec.timestamp, 'yymmddHHMMss', true), rec.MarketID, rec.StationName].join('/');
                await DB[rec._data].save(rec);
            }
        }

        await this.process(user._cmdr, rec);
        if (user._cmdr.last_rec < rec.timestamp) user._cmdr.last_rec = rec.timestamp;
    }

    emitf(ev, uid) {  //force emit
        super.emit(...arguments);
    }

    emit(ev, uid) { // ignore some event when overloaded
        if (ev === EV_PIPE || ev === EV_NET) {
            this.get_user({_id: uid})
                .then(user => {
                    if (!user._overload) super.emit(...arguments);
                });
        } else {
            return super.emit(...arguments);
        }

    }

    // for any records but careful with others cmdrs
    process(cmdr, rec) {
        try {
            if (rec.event === 'Scan') return this.proc_Scan(cmdr, rec);
            if (rec.event === 'SellExplorationData') return this.proc_SellExplorationData(cmdr, rec);
            if (rec.event === 'FSDJump') return this.proc_FSDJump(cmdr, rec);
            if (rec.event === 'Location') return this.proc_Location(cmdr, rec);
            if (rec.event === 'ApproachBody') return this.proc_ApproachBody(cmdr, rec);
            if (rec.event === 'LeaveBody') return this.proc_LeaveBody(cmdr, rec);
            if (rec.event === 'DiscoveryScan') return this.proc_DiscoveryScan(cmdr, rec);
            if (rec.event === 'NavBeaconScan') return this.proc_NavBeaconScan(cmdr, rec);
            if (rec.event === 'Docked') return this.proc_Docked(cmdr, rec);
            if (rec.event === 'Undocked') return this.proc_Undocked(cmdr, rec);
            if (rec.event === 'SupercruiseExit') return this.proc_SupercruiseExit(cmdr, rec);
        } catch (e) {
            clog('UNI.process()', rec.event, e);
        }
        return null;
    }


    async proc_SellExplorationData(cmdr, data) {
        await  cmdr._exp.exp_data_sell(cmdr, data);
        this.emit(EV_NET, cmdr.uid, 'exp-data', cmdr._exp.get_exp_data(false, cmdr.current_system_name()));
    }

    async proc_Scan(cmdr, Scan) {
        let body = await this.spawn_body(Scan.BodyName, cmdr.sys_id);
        if (!body) return;
        await body.append(cmdr, Scan);

        //track exploration data
        await cmdr._exp.exp_data_add(Scan, cmdr.sys_id);
        this.emit(EV_NET, cmdr.uid, 'exp-data', cmdr._exp.get_exp_data(false, cmdr.current_system_name()));

        if (body._id === cmdr.body_id)
            this.emit(EV_NET, cmdr.uid, 'c_body', body);
    }

    async proc_SupercruiseExit(cmdr, SupercruiseExit) {
        /*
        SupercruiseExit = {
            "timestamp": "2018-06-20T20:15:18Z",
            "event": "SupercruiseExit",
            "StarSystem": "Mundii",
            "SystemAddress": 16065191028137,
            "Body": "Elder Hub",
            "BodyID": 26,
            "BodyType": "Station"
        }
        */
        if (SupercruiseExit.BodyID && SupercruiseExit.BodyType === 'Station') {
            let station = await this.spawn_station(SupercruiseExit.Body, cmdr.sys_id);
            if (!station) return;
            if (station && !station.body_id) {
                station.body_id = SupercruiseExit.BodyID;
                station.save();
            }
        }

    }


    async proc_Undocked(cmdr, Docked) {
        cmdr.touch({st_id: null});
        this.emit(EV_NET, cmdr.uid, 'c_station', null);

    }
    async proc_Docked(cmdr, Docked) {
        let station = await this.spawn_station(Docked.StationName, cmdr.sys_id);
        if (!station) return;
        await station.append(cmdr, Docked);

        cmdr.touch({st_id: station._id});

        this.emit(EV_NET, cmdr.uid, 'c_station', station);
    }

    async proc_DiscoveryScan(cmdr, rec) {

        cmdr.metrics.curr_ds += rec.Bodies;
        cmdr.touch();

        await UNI.get_system(cmdr.sys_id)
            .then((system) => {
                if (!system) return;
                if (cmdr.metrics.curr_ds > system.ds_count) {
                    system.ds_count = cmdr.metrics.curr_ds;
                    this.emit(EV_NET, cmdr.uid, 'c_system', system);
                    return system.save();
                }
            });
    }

    async proc_NavBeaconScan(cmdr, rec) {

        cmdr.metrics.curr_ds = rec.NumBodies;

        cmdr.touch();

        await UNI.get_system(cmdr.sys_id)
            .then((system) => {
                if (!system) return;
                if (cmdr.metrics.curr_ds > system.ds_count)
                    system.ds_count = cmdr.metrics.curr_ds;
                return system.save();
            });

    }

    async proc_LeaveBody(cmdr, LeaveBody) {
        cmdr.touch({
            body_id: null,
        });
        this.emit(EV_NET, cmdr.uid, 'c_body', null);
    }

    async proc_ApproachBody(cmdr, ApproachBody) {
        let body = await this.spawn_body(ApproachBody.Body, cmdr.sys_id);
        cmdr.touch({
            body_id: body._id
        });
        this.emit(EV_NET, cmdr.uid, 'c_body', body);
    }

    async proc_Location(cmdr, Location) {
        let sys = await this.spawn_system(Location.StarSystem, Location.StarPos);
        if (!sys) return;
        await sys.append(cmdr, Location);

        let td = {
            sys_id: sys._id,
            starpos: sys.starpos,
        };

        if (Location.Body && Location.BodyType === 'Planet') {
            let body = await this.spawn_body(Location.Body, sys._id);
            body.append(cmdr, {});
            td.body_id = body._id;
        }
        cmdr.touch(td);

    }

    async proc_FSDJump(cmdr, FSDJump) {
        let sys = await this.spawn_system(FSDJump.StarSystem, FSDJump.StarPos);
        if (!sys) return;
        sys.append(cmdr, FSDJump);


        cmdr.touch({
            sys_id: sys._id,
            starpos: sys.starpos,
            body_id: null,
            metrics: {curr_ds: 0}
        });

        this.emit(EV_NET, cmdr.uid, 'c_system', sys);

        return this.emit(EV_NET, cmdr.uid, 'exp-data', cmdr._exp.get_exp_data(false, cmdr.current_system_name()));

    }

    user_msg(user, c, data) {
        clog(c, data);
        if (c === 'dest-set') { return user._cmdr ? user._cmdr.dest_set(data) : false; }
        if (c === 'dest-toggle') {return user._cmdr ? user._cmdr.dest.enabled = !!data : false;}
        if (c === 'repo-search') return this.repo_search(user, data);
        if (c === 'exp-refresh') return this.emit(EV_NET, user._id, 'exp-data', user._cmdr._exp.get_exp_data(true, user._cmdr.current_system_name()));
        if (c === 'exp-reset') {
            user._cmdr._exp.reset();
            return this.emit(EV_NET, user._id, 'exp-data', user._cmdr._exp.get_exp_data(true, user._cmdr.current_system_name()));
        }

    }

    async repo_search(user, query) {
        DB.reports
            .find({uid: user._id})
            .limit(32)
            .sort({submited: -1})
            .toArray()
            .then(list => this.emit(EV_NET, user._id, 'repo-search', list));
    }

    /**
     * Get or create body
     * @param body_name
     * @param sys_id
     * @returns {Promise<BODY>}
     */
    async spawn_body(body_name, sys_id) {

        //find system
        let sys = await this.get_system(sys_id);
        if (!sys) return null;

        let body_id = Universe.body_id(sys_id, body_name);
        let b = await this.get_body(body_id);

        if (b) return new BODY(b);
        b = new BODY({
            _id: body_id,
            sys_id: sys._id, // or by sys id
            sys_name: sys.name, // to make search by system easy
            starpos: sys.starpos.slice(), // to make search by pos easy
            name: tools.convert.LOW_CASE(body_name),
            name_raw: body_name,
            short_name: tools.convert.LOW_CASE(body_name).replace(sys.name, '').trim() || FIRST_SYS_OBJ,
            type: null,
        });
        await b.save();
        return b;
    }

    /**
     * get Body
     * @param body_id
     * @returns {Promise<BODY>}
     */
    async get_body(body_id) {
        let b = await DB.bodies.findOne({_id: body_id});
        if (b) return new BODY(b);
        return null;
    }


    /**
     * Get or create station
     * @param station_name
     * @param sys_id
     * @returns {Promise<STATION>}
     */
    async spawn_station(station_name, sys_id) {

        //find system
        let sys = await this.get_system(sys_id);
        if (!sys) return null;

        let st_id = Universe.st_id(sys_id, station_name);
        let b = await this.get_station(st_id);

        if (b) return new STATION(b);
        b = new STATION({
            _id: st_id,
            sys_id: sys._id, // or by sys id
            sys_name: sys.name, // to make search by system easy
            starpos: sys.starpos.slice(), // to make search by pos easy
            name: tools.convert.LOW_CASE(station_name),
            name_raw: station_name,
            type: null,
        });
        await b.save();
        return b;
    }

    /**
     * get Station by ID
     * @param st_id
     * @returns {Promise<STATION>}
     */
    async get_station(st_id) {
        let b = await DB.stations.findOne({_id: st_id});
        if (b) return new STATION(b);
        return null;
    }


    /**
     * Get user by mongodb query. Is also can be cached in Universe Instance
     * @param {object} by is MongoDB query.
     * @returns {Promise<USER>}
     */
    async get_user(by) {
        let user = null;

        if (by._id && this.users[by._id]) {
            return this.users[by._id];
        } else if (by.api_key && this.users_api_key[by.api_key]) {
            return this.users_api_key[by.api_key];
        } else {
            let dat = await DB.users.findOne(by);
            if (dat) {
                if (this.users[dat._id]) return this.users[dat._id]; //already loaded
                user = new USER(dat);
                await user.init();
                this.users[user._id] = user;
                this.users_api_key[user.api_key] = user;
                return user;
            }
        }
        return user;
    }

    /**
     * Load or create cmdr for user
     * @param {string} uid User ID
     * @param {string} name CMDR Name
     * @returns {Promise<CMDR>}
     */
    async get_cmdr(uid, name) {

        let cmdr_id = uid + '/' + name;

        if (!this.cmdrs[cmdr_id]) {
            let dat = await DB.cmdrs.findOne({_id: cmdr_id});
            if (dat) {
                this.cmdrs[cmdr_id] = new CMDR(dat);
            } else {
                this.cmdrs[cmdr_id] = new CMDR({
                    _id: cmdr_id,
                    uid: uid,
                    name: name,
                });
            }
            await this.cmdrs[cmdr_id].init();
        }
        return this.cmdrs[cmdr_id];
    }


    /**
     * Get or create system with name and starposinates
     * @param {string} name
     * @param {array} starpos SparPos[x,y,z]
     * @returns {Promise<SYSTEM>}
     */
    async spawn_system(name, starpos) {
        let id = Universe.sys_id(name, starpos);
        let s = await DB.systems.findOne({_id: id});

        if (s) return new SYSTEM(s);

        s = new SYSTEM({
            _id: id,
            name: name,
            starpos: starpos.map((x) => {return Math.floor(x * 32)}),
        });
        await s.save();
        return s;
    }

    async get_system(sys_id) {
        let s = await DB.systems.findOne({_id: sys_id});
        if (s) return new SYSTEM(s);
        return null;
    }

    /**
     * Create ID from name and starposinates [x,y,z]
     * @param {string} name
     * @param {array} starpos SparPos[x,y,z]
     * @returns {string} Cool System ID
     */
    static sys_id(name, starpos) {
        return tools.convert.LOW_CASE(name) + SEP_SYSTEM + starpos.map(x => Math.round(x * 32)).join(SEP_COORD);
    }

    static body_id(sys_id, body_name) {
        let n = tools.convert.LOW_CASE(body_name).replace(sys_id.split(SEP_SYSTEM)[0], '').trim();
        return sys_id + SEP_BODY + (n ? n : FIRST_SYS_OBJ);
    }

    static st_id(sys_id, station_name) {
        return sys_id + SEP_BODY + tools.convert.LOW_CASE(station_name);
    }

}


const UNI = new Universe();
module.exports = UNI;

let CMDR = require('./cmdr').init(UNI, DB);
let SYSTEM = require('./system').init(UNI, DB);
let BODY = require('./body').init(UNI, DB);
let USER = require('./user').init(UNI, DB);
let STATION = require('./station').init(UNI, DB);


