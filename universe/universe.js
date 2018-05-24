'use strict';

// @link: https://ed.miggy.org/fd-journal-docs/
const dateformat = require('dateformat');
const EE3 = require('eventemitter3');
const extend = require('deep-extend');
const DB = require('./database');
const server = require('../server');
const pick = server.tools.pick;
const pickx = server.tools.pickx;
const con = server.tools.convert;
const checksum = server.tools.checksum;
const pre = require('./pre');

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
        this.alive = false;
        console.log('UNIVERSE: OK');
    }

    init() {
        this.alive = true;

        console.log('UNIVERSE ALIVE & CAN BROADCAST');

        this.autosave = setInterval(() => {
            for (let c in this.cmdrs) this.cmdrs[c].save();
            for (let u in this.users) this.users[u].save();
        }, 60000);
    }

    refill_user(uid) {
        return this.get_user({_id: uid})
            .then(async (user) => {
                if (!user) throw new Error();


                if (user._overload) {
                    user.track_overload();
                    UNI.emitf(EV_NET, user._id, 'overload', true);
                }

                this.emit(EV_NET, user._id, 'user', {
                    email: user.email,
                    api_key: user.api_key
                });

                if (!user._cmdr) return;

                this.emit(EV_NET, user._id, 'cmdr', user._cmdr);
                this.emit(EV_NET, user._id, 'status', user._cmdr.status);

                if (user.journal()) {
                    let scans = user.journal().find({event: 'Scan'}).sort({timestamp: -1}).limit(5);
                    scans.forEach((rec) => this.emit(EV_PIPE, user._id, rec.event, rec));
                }

                if (user._cmdr.system_id) {
                    let sys = await this.get_system(user._cmdr.system_id);
                    this.emit(EV_NET, uid, 'c_system', sys);
                }

                if (user._cmdr.body_id) {
                    let body = await this.get_body(user._cmdr.body_id);
                    this.emit(EV_NET, uid, 'c_body', body);
                }

            })
            .catch((e) => {
                console.log(`UNI::refill_user(${uid}) - can't refill user;`, e);
            });
    }

    async upd_status(user, Status, cmdr_name, gv, lng) {

        user.track_overload(0);

        //this.emit(EV_PIPE, user._id, Status.event, Status);

        if (user.cmdr_name !== cmdr_name) await user.set_cmdr(cmdr_name);

        // user._cmdr.touch({ status: ...don't cause unnecessary update.
        // send only status
        extend(user._cmdr.status, {
            flags: Status.Flags,
            pips: Status.Pips,
            fgroup: Status.FireGroup || 0,
            lat: Status.Latitude || null,
            lon: Status.Longitude || null,
            alt: Status.Altitude || null,
            head: Status.Heading || null,
            _upd: new Date(Status.timestamp)
        });
        user._cmdr._ch = true; // but mark as changed
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


            await user.journal().save(rec);
        } else if (typeof rec._data !== 'undefined') {
            if (['shipyard', 'market', 'outfitting'].includes(rec._data)) {
                rec._id = [dateformat(rec.timestamp, 'yymmddHHMMss', true), rec.MarketID, rec.StationName].join('/');
                DB[rec._data].save(rec);
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
            super.emit(...arguments);
        }
    }

    // for any records but careful with others cmdrs
    process(cmdr, rec) {
        try {
            if (rec.event === 'Scan') return this.proc_Scan(cmdr, rec);
            if (rec.event === 'FSDJump') return this.proc_FSDJump(cmdr, rec);
            if (rec.event === 'Location') return this.proc_Location(cmdr, rec);
            if (rec.event === 'ApproachBody') return this.proc_ApproachBody(cmdr, rec);
            if (rec.event === 'LeaveBody') return this.proc_LeaveBody(cmdr, rec);
            if (rec.event === 'DiscoveryScan') return this.proc_DiscoveryScan(cmdr, rec); //todo: << this is probably useless
            if (rec.event === 'NavBeaconScan') return this.proc_NavBeaconScan(cmdr, rec);
        } catch (e) {
            console.log('UNI.process()',rec.event, e);
        }
        return null;
    }

    async repo_search(user, query) {
        DB.reports
            .find({uid: user._id})
            .sort({submited: -1})
            .toArray()
            .then(list => this.emit(EV_NET, user._id, 'repo-search', list));
    }

    async repo_submit(user, report) {
        //Buffer.from('hello world', 'utf8').toString('hex');

        let r = {
            _id: null,
            type: 'NA',
            system: '',
            body: '',
            subject: '',
            description: '',
            links: [],
            pub: false, //other peopl can find it
            locked: false, //report confirmed nad locked
            lat: '',
            lon: '',
            reporter: null,

            //user can't edit
            parent_id: null, //for a few reports in the same place
            starpos: [0, 0, 0], // get automatically from the system
            system_id: null, // get automatically from
            body_id: null,
        };


        if (report._id) {
            r = await DB.reports.findOne({_id: report._id});
            if (r.locked || user._id !== r.uid) {
                //you can't edit locked reports or reports from other players
                return this.emit(EV_NET, user._id, 'repo-submition', {
                    result: 0,
                    type: 'warn',
                    msg: 'Report has been locked!',
                    desc: 'This has been verified and locked, and can`t be edited.'
                })
            }
        } else {
            r._id = DB.gen_id();
            r.uid = user._id;
            r.submited = new Date(Date.now());
        }

        if (!report.subject) {
            return this.emit(EV_NET, user._id, 'repo-submition', {
                result: 0,
                type: 'error',
                msg: 'Report Subject not specified!',
                desc: 'This field is required for htis type or reports'
            })
        }

        //todo: a lot of validation job!
        if (!report.system) {
            return this.emit(EV_NET, user._id, 'repo-submition', {
                result: 0,
                type: 'error',
                msg: 'System not specified!',
                desc: 'Location section should contain valid system name'
            })
        }

        if (!report.reporter) {
            return this.emit(EV_NET, user._id, 'repo-submition', {
                result: 0,
                type: 'error',
                msg: 'Reporter CMDR name is requierd',
                desc: 'You can\'t submit report anonymously'
            })
        }

        r.type = report.type;
        r.sub_type = report.sub_type;
        r.subject = report.subject;
        r.system = report.system;
        r.body = report.body;
        r.description = report.description;
        r.links = report.links;
        r.pub = report.pub;
        r.lat = report.lat;
        r.lon = report.lon;
        r.reporter = report.reporter;

        //user can't edit
        r.starpos = report.starpos;
        r.system_id = report.system_id;
        r.body_id = report.body_id;
        r.updated = new Date(Date.now());

        await DB.reports.save(r);

        this.emit(EV_NET, user._id, 'repo-submition', {
            result: 1,
            type: '',
            msg: 'report submited'
        });

        this.emit(EV_NET, user._id, 'repo-current', r);
    }

    user_data(user, c, data) {
        if (c === 'repo-submit') return this.repo_submit(user, data);
        if (c === 'repo-search') return this.repo_search(user, data);
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
        this.emit(EV_NET, cmdr.uid, 'c_body', null);
    }

    async proc_ApproachBody(cmdr, ApproachBody) {
        let body = await this.spawn_body(ApproachBody.Body, cmdr.system_id);
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
            system_id: sys._id,
            starpos: sys.starpos,
        };

        if (Location.Body && Location.BodyType === 'Planet') {
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

        this.emit(EV_NET, cmdr.uid, 'c_system', sys);
    }

    async proc_Scan(cmdr, Scan) {

        let body = await this.spawn_body(Scan.BodyName, cmdr.system_id);
        if (!body) return;
        body.append(cmdr, Scan);

        //update cmdr scan data if we waiting for it
        if (body._id === cmdr.body_id)
            this.emit(EV_NET, cmdr.uid, 'c_body', body);

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
        let b = await this.get_body(body_id);

        //todo: shoudl we do socme cache like with cmdrs or users?
        if (b) return new BODY(b);
        return new BODY({
            _id: body_id,
            sys_id: sys._id, // or by sys id
            sys_name: sys.name, // to make search by system easy
            starpos: sys.starpos.slice(), // to make search by pos easy
            name: con.ED_CAPS(body_name),
            short_name: con.ED_CAPS(body_name).replace(sys.name, '').trim() || FIRST_SYS_OBJ,
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
        return con.ED_CAPS(name) + SEP_SYSTEM + starpos.map(x => Math.round(x * 32)).join(SEP_COORD);
    }

    static body_id(system_id, body_name) {
        let n = con.ED_CAPS(body_name).replace(system_id.split(SEP_SYSTEM)[0], '').trim();
        return system_id + SEP_BODY + (n ? n : FIRST_SYS_OBJ);
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
        extend(this, body);
    }

    append(cmdr, rec) {

        this.type = 'cluster';

        if (rec.StarType) this.type = 'star';
        if (rec.PlanetClass) this.type = 'planet';

        pickx(rec, this,
            ['BodyName', 'name', con.ED_CAPS],
            ['BodyName', 'name_raw'],
            ['BodyID', 'body_id'],
            ['DistanceFromArrivalLS', 'arrival'],
            ['Radius', 'radius'],

            //starts
            ['Luminosity', 'luminosity'],
            ['StarType', 'class'],
            ['AbsoluteMagnitude', 'star_absm'],
            ['Age_MY', 'age'],
            ['StellarMass', 'mass', con.Sol2GT],

            //planets
            ['Landable', 'landable', con.toBool, true],
            ['PlanetClass', 'class'],
            ['MassEM', 'mass', con.Earth2GT],
            ['SurfaceGravity', 'surf_gravity', con.GF2Gravity],
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
            ['StarSystem', 'name', con.ED_CAPS],
            ['StarSystem', 'name_raw'],
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
        this.cmdr_name = null;
        this.last_rec = new Date(0);
        this.cmdrs = [];
        this.online = false;
        this.dev = false;
        this._rec_left = 0;
        this._overload = false;
        this._overtimeout = null;
        this._cmdr = null;
        extend(this, data);
    }

    track_overload(records_left = null) {

        if (records_left === null) {
            records_left = this._rec_left;
        }

        if (records_left && !this._overload) {
            UNI.emitf(EV_NET, this._id, 'overload', true);
            this._overload = true;
        }

        if (records_left === 0) {
            if (this._overtimeout) {
                clearTimeout(this._overtimeout);
                this._overtimeout = null;
            }
            //re-fill timeout
            this._overtimeout = setTimeout(() => {
                if (this._rec_left && this._overload) return;
                if (this._overload && !this._rec_left) {
                    this._overload = false;
                    UNI.emit(EV_NET, this._id, 'overload', false);
                    UNI.refill_user(this._id);

                    clearTimeout(this._overtimeout);
                    this._overtimeout = null;
                }
            }, 500);
        }
        this._rec_left = records_left;
    }

    async init() {
        if (this.cmdr_name) this._cmdr = await UNI.get_cmdr(this._id, this.cmdr_name);
    }

    async set_cmdr(name) {
        if (!name) return;
        this._cmdr = await UNI.get_cmdr(this._id, name);
        this.cmdr_name = name;
        if (!this.cmdrs.includes(name)) this.cmdrs.push(name);
        this._ch = true;
        UNI.emit(EV_NET, this._id, 'user', this);
        UNI.emit(EV_NET, this._id, 'cmdr', this);
    }

    async save() {
        if (!this._ch) return;

        let snapshot = {};

        for (let p in this)
            if (p[0] !== '_' || p === '_id') snapshot[p] = this[p];

        await DB.users.save(snapshot);
        this._ch = false;
    }

    journal() {
        if (this._cmdr)
            return DB.journal(`[${this._id}] ${this._cmdr.name}`);
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
        if (this.uid) UNI.emit(EV_NET, this.uid, 'cmdr', this);
    }

    async save() {
        if (!this._ch) return;
        if (!this._id || !this.uid) return;
        let snapshot = {};
        for (let p in this)
            if (p[0] !== '_' || p === '_id') snapshot[p] = this[p];
        await DB.cmdrs.save(snapshot);
        this._ch = false;
    }
}

const UNI = new Universe();
module.exports = UNI;


