'use strict';

// @link: https://ed.miggy.org/fd-journal-docs/
const dateformat = require('dateformat');
const EE3 = require('eventemitter3');
const extend = require('deep-extend');
const DB = require('./database');
const server = require('../server');
const pick = server.tools.pick;
const pickx = server.tools.pickx;
const convert = server.tools.convert;
const checksum = server.tools.checksum;
const pre = require('./pre');

global.EV_USRUPD = 'uni-usr';
global.EV_USRPIPE = 'uni-pipe';
global.EV_DATA = 'uni-data';

class Universe extends EE3 {
    constructor() {
        super();
        this.users = {};
        this.cmdrs = {};
        this.users_api_key = {};
        this.alive = false;
        console.log('UNIVERSE: OK');
    }

    init() {
        this.alive = true;

        console.log('UNIVERSE ALIVE & CAN BROADCAST');

        this.autosave = setInterval(() => {
            for (let c in this.cmdrs) this.cmdrs[c].save();
            for (let u in this.users) this.users[u].save();
        }, 5000);

    }


    refill_user(uid) {
        return this.get_user({_id: uid})
            .then(async (user) => {

                if (!user) throw new Error();

                if (!user.cmdr) return;

                if (user.journal()) {
                    let scans = user.journal().find({event: 'Scan'}).sort({timestamp: -1}).limit(5);
                    scans.forEach((rec) => this.emit(EV_USRPIPE, user._id, rec.event, rec));
                }

                if (user.cmdr.system_id) {
                    let sys = await this.get_system(user.cmdr.system_id);
                    this.emit(EV_DATA, uid, 'c_system', sys);
                }

                if (user.cmdr.body_id) {
                    let body = await this.get_body(user.cmdr.body_id);
                    this.emit(EV_DATA, uid, 'c_body', body);
                }

            })
            .catch((e) => {
                console.log(`UNI::refill_user(${uid}) - can't refill user;`);
            });
    }

    upd_status(user, status, cmdr_name, gv, lng) {
        this.emit(EV_USRPIPE, user._id, status.event, status)
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
            if (records_left < 5) UNI.emit(EV_USRPIPE, user._id, rec.event, rec);
            await user.journal().save(rec);
        } else if (typeof rec._data !== 'undefined') {
            if (['shipyard', 'market', 'outfitting'].includes(rec._data)) {
                rec._id = [dateformat(rec.timestamp, 'yymmddHHMMss', true), rec.MarketID, rec.StationName].join('/');
                DB[rec._data].save(rec);
            }
        }

        await this.process(user.cmdr, rec);
        if (user.cmdr.last_rec < rec.timestamp) user.cmdr.last_rec = rec.timestamp;
    }

    // for any records but careful with others cmdrs
    process(cmdr, rec) {
        if (rec.event === 'Scan') return this.proc_Scan(cmdr, rec);
        if (rec.event === 'FSDJump') return this.proc_FSDJump(cmdr, rec);
        if (rec.event === 'Location') return this.proc_Location(cmdr, rec);
        if (rec.event === 'ApproachBody') return this.proc_ApproachBody(cmdr, rec);
        if (rec.event === 'LeaveBody') return this.proc_LeaveBody(cmdr, rec);
        if (rec.event === 'DiscoveryScan') return this.proc_DiscoveryScan(cmdr, rec); //todo: << this is probably useless
        if (rec.event === 'NavBeaconScan') return this.proc_NavBeaconScan(cmdr, rec);
    }

    async proc_DiscoveryScan(cmdr, rec) {

        cmdr.metrics.curr_ds += rec.Bodies;
        cmdr.touch();

        await  UNI.get_system(cmdr.system_id)
            .then((system) => {
                if (!system) return;
                if (cmdr.metrics.curr_ds > system.ds_count)
                    system.ds_count = cmdr.metrics.curr_ds;
                return system.save();
            });

    }

    async proc_NavBeaconScan(cmdr, rec) {

        cmdr.metrics.curr_ds = rec.NumBodies;

        cmdr.touch();

        await UNI.get_system(cmdr.system_id)
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
        this.emit(EV_DATA, cmdr.uid, 'c_body', null);
    }

    async proc_ApproachBody(cmdr, ApproachBody) {
        let body = await this.spawn_body(ApproachBody.Body, cmdr.system_id);

        cmdr.touch({
            body_id: body._id
        });
        this.emit(EV_DATA, cmdr.uid, 'c_body', body);
    }

    async proc_Location(cmdr, Location) {
        let sys = await this.spawn_system(Location.StarSystem, Location.StarPos);
        if (!sys) return;
        await sys.append(cmdr, Location);

        let td = {
            system_id: sys._id,
            starpos: sys.starpos,
        };

        if (Location.Body) {
            let body = await this.spawn_body(Location.Body, sys._id);
            td.body_id = body._id;
        }
        cmdr.touch(td);

    }

    async proc_FSDJump(cmdr, FSDJump) {
        let sys = await this.spawn_system(FSDJump.StarSystem, FSDJump.StarPos);
        if (!sys) return;
        sys.append(cmdr, FSDJump);
        cmdr.touch({
            system_id: sys._id,
            starpos: sys.starpos,
            body_id: null,
            metrics: {curr_ds: 0}
        });

        this.emit(EV_DATA, cmdr.uid, 'c_system', sys);
    }

    async proc_Scan(cmdr, Scan) {

        let body = await this.spawn_body(Scan.BodyName, cmdr.system_id);
        if (!body) return;
        body.append(cmdr, Scan);

        //update cmdr scan data if we waiting for it
        if (body._id === cmdr.body_id)
            this.emit(EV_DATA, cmdr.uid, 'c_body', body);

    }

    /**
     * Get or create body
     * @param body_name
     * @param system_id
     * @returns {Promise<BODY>}
     */
    async spawn_body(body_name, system_id) {

        //find system
        let sys = await this.get_system(system_id);
        if (!sys) return null;

        let body_id = Universe.body_id(system_id, body_name);
        let b = await DB.systems.findOne({_id: body_id});

        //todo: shoudl we do socme cache like with cmdrs or users?
        if (b) return new BODY(b);
        return new BODY({
            _id: body_id,
            sys_id: sys._id, // or by sys id
            sys_name: sys.name, // to make search by system easy
            starpos: sys.starpos.slice(), // to make search by pos easy
            name: body_name,
            type: null,
        });
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
        let id = Universe.system_id(name, starpos);
        let s = await DB.systems.findOne({_id: id});

        if (s) return new SYSTEM(s);

        //todo: shoudl we do socme cache like with cmdrs or users?
        return new SYSTEM({
            _id: id,
            name: name,
            starpos: starpos,
        });
    }

    async get_system(system_id) {
        let s = await DB.systems.findOne({_id: system_id});
        if (s) return new SYSTEM(s);
        return null;
    }

    /**
     * Create ID from name and starposinates [x,y,z]
     * @param {string} name
     * @param {array} starpos SparPos[x,y,z]
     * @returns {string} Cool System ID
     */
    static system_id(name, starpos) {
        return name + '@' + starpos.map(x => Math.round(x * 32)).join(':');
    }

    static body_id(system_id, body_name) {
        let n = body_name.replace(system_id.split('@')[0], '').trim();
        return system_id + '/' + (n ? n : '*');
    }

}


class BODY {
    constructor(body) {
        this._id = null;
        this.name = null;
        this.submited_by = null;
        this.submited = null;
        this.last_update = null;
        this.type = null;
        extend(this, body)
    }

    append(cmdr, rec) {

        this.type = 'cluster'

        if (rec.StarType) this.type = 'star';
        if (rec.PlanetClass) this.type = 'planet';

        pickx(rec, this,
            ['BodyName', 'name'],
            ['BodyID', 'body_id'],
            ['DistanceFromArrivalLS', 'arrival'],
            ['Radius', 'radius'],

            //starts
            ['Luminosity', 'luminosity'],
            ['StarType', 'class'],
            ['AbsoluteMagnitude', 'star_absm'],
            ['Age_MY', 'age'],
            ['StellarMass', 'mass', convert.Sol2GT],

            //planets
            ['Landable', 'landable', convert.toBool, true],
            ['PlanetClass', 'class'],
            ['MassEM', 'mass', convert.Earth2GT],
            ['SurfaceGravity', 'surf_gravity', convert.GF2Gravity],
            ['SurfacePressure', 'surf_presure'],
            ['SurfaceTemperature', 'surf_temperature'],
            ['TerraformState', 'terraform_state'],
            ['Volcanism', 'volcanism'],
            ['Composition', 'composition'],
            ['Atmosphere', 'atmo'],
            ['AtmosphereType', 'atmo_type'],
            ['ReserveLevel', 'reserve_level'],

            //orbit / rotatation / position
            ['Parents', 'parents'],
            ['SemiMajorAxis', 'o_smaxis'],
            ['Eccentricity', 'o_eccentricity'],
            ['OrbitalInclination', 'o_inclination'],
            ['Periapsis', 'o_periapsis'],
            ['OrbitalPeriod', 'o_period'],
            ['RotationPeriod', 'rot_period'],
            ['AxialTilt', 'rot_axial_tilt'],
            ['TidalLock', 'rot_tidal_lock'],

            //estimate added by pre.process
            ['EstimatedValue', 'estimated_value'],
        );

        if (rec.AtmosphereComposition) {
            if (!this.atmo_composition) this.atmo_composition = {};
            for (let i in rec.AtmosphereComposition) this.atmo_composition[rec.AtmosphereComposition[i].Name] = rec.AtmosphereComposition[i].Percent;
        }

        if (rec.Materials) {
            if (!this.materials) this.materials = {};
            for (let i in rec.Materials) this.materials[rec.Materials[i].Name] = rec.Materials[i].Percent;
        }

        if (rec.Rings) {
            if (!this.rings) this.rings = [];
            for (let i in rec.Rings) {
                this.rings.push({
                    name: rec.Rings[i].Name,
                    clas: rec.Rings[i].RingClass,
                    mass: rec.Rings[i].MassMT / 1000, //GT
                    r_inner: rec.Rings[i].InnerRad / 1000,
                    r_outer: rec.Rings[i].OuterRad / 1000,
                });
            }
        }

        if (!this.submited_by /*|| this.submited > rec.timestamp*/) {
            this.submited_by = cmdr.name;
            this.submited = rec.timestamp;
        }
        if (this.last_update < rec.timestamp)
            this.last_update = rec.timestamp;

        return this.save();
    }

    async save() {
        //no temporary fields here...
        await DB.bodies.save(this);
    }
}

class SYSTEM {
    constructor(sys) {
        this._id = null;
        this.name = null;
        this.submited_by = null;
        this.submited = null;
        this.last_update = null;
        this.ds_count = 0;
        extend(this, sys);
    }

    append(cmdr, rec) {
        pickx(rec, this,
            ['StarSystem', 'name'],
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
                pickx(rec.Factions[i], fa,
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


        if (!this.submited || this.submited > rec.timestamp) {
            this.submited = rec.timestamp;
            this.submited_by = cmdr.name;
        }
        if (this.last_update < rec.timestamp)
            this.last_update = rec.timestamp;

        return this.save();
    }


    async save() {
        //no temporary fields here...
        await DB.systems.save(this);
    }
}


class USER {
    constructor(data) {
        this._id = null;
        this._ch = true;
        this.cmdr = null;
        this.cmdr_name = null;
        this.last_rec = new Date(0);
        this.cmdrs = [];
        this.online = false;
        this.dev = false;

        extend(this, data);
    }

    async init() {
        if (this.cmdr_name) this.cmdr = await UNI.get_cmdr(this._id, this.cmdr_name);
    }

    async set_cmdr(name) {
        if (!name) return;
        this.cmdr = await UNI.get_cmdr(this._id, name);
        this.cmdr_name = name;
        if (!this.cmdrs.includes(name)) this.cmdrs.push(name);
        this._ch = true;
        UNI.emit(EV_USRUPD, this._id, 'user', this);
        UNI.emit(EV_USRUPD, this._id, 'cmdr', this);
    }

    async save() {
        if (!this._ch) return;
        let snapshot = {};
        extend(snapshot, this);
        delete snapshot.cmdr; //remove temporary field from snapshot
        delete snapshot._ch; //remove temporary field from snapshot
        await DB.users.save(snapshot);
        this._ch = false;
    }

    journal() {
        if (this.cmdr)
            return DB.journal(`[${this._id}] ${this.cmdr.name}`);
    }
}

class CMDR {
    constructor(cmdr_data) {
        this._id = null;
        this._ch = true;
        this.uid = null;
        this.name = null;
        this.last_rec = new Date(0);
        this.system_id = null;
        this.body_id = null;
        this.starpos = [0, 0, 0];
        this.metrics = {curr_ds: 0};
        this.status = {};
        extend(this, cmdr_data);
    }

    touch(data = null) {
        if (data) extend(this, data);
        this._ch = true;
        if (this.uid) UNI.emit(EV_USRUPD, this.uid, 'cmdr', this);
    }

    async save() {
        if (!this._ch) return;
        if (!this._id || !this.uid) return;
        let snapshot = {};
        extend(snapshot, this);
        delete snapshot._ch;
        await DB.cmdrs.save(snapshot);
        this._ch = false;
    }
}

const UNI = new Universe();
module.exports = UNI;


