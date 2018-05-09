'use strict';
const extend = require('deep-extend');
const DB = require('./database');
const server = require('../server');
const dot = require('dot-object');

class Universe {
    constructor() {
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
        }, 5200);

    }

    /* ONLY FOR NEW RECORDS */
    async record(user, rec, cmdr_name, gv, lng) {

        if (cmdr_name !== user.cmdr_name) await user.set_cmdr(cmdr_name);

        rec._id = rec.event + '/' + rec.timestamp;
        rec.timestamp = new Date(rec.timestamp);
        rec._lng = lng;
        rec._gv = gv;

        await user.journal().save(rec);

        await UNI.process(user.cmdr, rec);

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

        await  UNI.get_system(cmdr.loc.system.id)
            .then((system) => {
                if (!system) return;
                if (cmdr.metrics.curr_ds > system.ds_count)
                    system.ds_count = cmdr.metrics.curr_ds;
                return system.save();
            });

    }

    async proc_NavBeaconScan(cmdr, rec) {

        cmdr.metrics.curr_ds = rec.NumBodies;
        console.log(cmdr.loc.system, rec.NumBodies);
        cmdr.touch();

        await UNI.get_system(cmdr.loc.system.id)
            .then((system) => {
                if (!system) return;
                if (cmdr.metrics.curr_ds > system.ds_count)
                    system.ds_count = cmdr.metrics.curr_ds;
                return system.save();
            });

    }

    async proc_LeaveBody(cmdr, rec) {
        cmdr.touch({
            loc: {
                body: {
                    name: null,
                    r: null,
                    g: null,
                }
            }
        });
    }

    async proc_ApproachBody(cmdr, rec) {

        let body = await DB.bodies.findOne({BodyName: rec.Body});

        cmdr.touch({
            loc: {
                body: {
                    name: rec.Body,
                    r: body ? body.Radius : null,
                    g: body ? body.SurfaceGravity : null,
                }
            }
        });
    }


    async proc_Location(cmdr, rec) {
        let sys = await this.spawn_system(rec.StarSystem, rec.StarPos);
        if (!sys) return;
        await sys.append(cmdr, rec);
        cmdr.touch({
            loc: {
                system: {name: sys.name, starpos: sys.starpos, id: sys._id},
            },
        });
    }

    async proc_FSDJump(cmdr, rec) {
        let sys = await this.spawn_system(rec.StarSystem, rec.StarPos);
        if (!sys) return;
        sys.append(cmdr, rec);
        cmdr.touch({
            loc: {
                system: {name: sys.name, starpos: sys.starpos, id: sys._id},
                body: {name: null, r: null, g: null}
            },
            metrics: {curr_ds: 0}
        });
    }

    async proc_Scan(cmdr, rec) {
        let body = await DB.bodies.findOne({_id: rec.BodyName});

        // process scan
        if (body) {
            if (body.ScanType === 'Detailed') return;
        } else {
            body = {_id: rec.BodyName, _submited: rec._cmdr};
        }

        //create body record
        for (let i in rec) {
            if (i[0] === '_' || i === 'event') continue;
            body[i] = rec[i];
        }
        await DB.bodies.save(body).catch((e) => {console.log(e)});

        //update cmr scan data if we waiting for it
        if (cmdr.uid && rec.BodyName === cmdr.loc.body.name) {
            cmdr.touch({
                loc: {
                    body: {
                        name: rec.BodyName,
                        r: rec.Radius,
                        g: rec.SurfaceGravity,
                    }
                }
            });
        }
    }

    broadcast(uid, c, dat) {
        //todo: nice place to fire event
        if (this.alive) server.CLS.send_to(uid, c, dat);
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
                    loc: {
                        system: {name: null, starpos: [0, 0, 0]},
                        body: {name: null, r: null, g: null},
                    }
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

}

class BODY {
    construct(body) {
        this._id = null;
        this.name = null;
        this.submited_by = null;
        this.submited = null;
        this.last_update = null;
    }

    append(cmdr, rec) {

        if (!this.submited || this.submited > rec.timestamp) {
            dot.copy('timestamp', 'submited', rec, this);
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

        dot.copy('StarSystem', 'name', rec, this);

        if (rec.StarPos) {
            dot.copy('StarPos.0', 'starpos.0', rec, this, x => Math.floor(x * 32));
            dot.copy('StarPos.1', 'starpos.1', rec, this, x => Math.floor(x * 32));
            dot.copy('StarPos.2', 'starpos.2', rec, this, x => Math.floor(x * 32));
        }

        dot.copy('SystemAllegiance', 'allegiance', rec, this);
        dot.copy('SystemEconomy', 'economy', rec, this);
        dot.copy('SystemGovernment', 'government', rec, this);
        dot.copy('SystemSecurity', 'security', rec, this);
        dot.copy('Population', 'population', rec, this);
        dot.copy('SystemFaction', 'faction', rec, this);

        if (rec.Factions) {
            this.factions = [];
            for (let i in rec.Factions) {
                dot.copy('Factions.' + i + '.Name', 'factions.' + i + '.name', rec, this);
                dot.copy('Factions.' + i + '.FactionState', 'factions.' + i + '.state', rec, this);
                dot.copy('Factions.' + i + '.Government', 'factions.' + i + '.government', rec, this);
                dot.copy('Factions.' + i + '.Influence', 'factions.' + i + '.influence', rec, this);
                dot.copy('Factions.' + i + '.Allegiance', 'factions.' + i + '.allegiance', rec, this);

                if (rec.Factions[i].PendingStates) {
                    for (let s in rec.Factions[i].PendingStates) {
                        dot.set(
                            `factions.${i}.pending.${rec.Factions[i].PendingStates[s].State}`,
                            rec.Factions[i].PendingStates[s].Trend,
                            this);
                    }
                }
            }
        }


        if (!this.submited || this.submited > rec.timestamp) {
            dot.copy('timestamp', 'submited', rec, this);
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
        UNI.broadcast(this._id, 'user', this);
        UNI.broadcast(this._id, 'cmdr', this);
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
        this.loc = {
            system: {name: null, starpos: [0, 0, 0], id: null},
            body: {name: null, r: null, g: null},
        };
        this.metrics = {curr_ds: 0};
        this.status = {};
        extend(this, cmdr_data);
    }

    touch(data = null) {
        if (data) extend(this, data);
        this._ch = true;
        if (this.uid) UNI.broadcast(this.uid, 'cmdr', this);
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


