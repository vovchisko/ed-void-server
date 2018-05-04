'use strict';
const extend = require('deep-extend');
const DB = require('./database');
const server = require('../server');

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
        if (rec.event === 'ApproachBody') return this.proc_ApproachBody(cmdr, rec);
        if (rec.event === 'LeaveBody') return this.proc_LeaveBody(cmdr, rec);
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

    async proc_FSDJump(cmdr, rec) {
        let system = await DB.systems.findOne({_id: rec.StarSystem});

        if (!system) system = {_id: rec.StarSystem, _submited: rec._cmdr};

        for (let i in rec) {
            if (i[0] === '_' || i === 'event' || i.includes('_Localised')) continue;
            system[i] = rec[i];
        }

        await DB.systems.save(system);

        cmdr.touch({
            loc: {
                system: {name: system.StarSystem, coord: system.StarPos},
                body: {name: null, r: null, g: null,}
            }
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
        await DB.bodies.save(body);

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
        if (this.alive) server.CLS.send_to(uid, c, dat);
    }

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
                        system: {name: null, coord: [0, 0, 0]},
                        body: {name: null, r: null, g: null},
                    }
                });
            }
        }
        return this.cmdrs[cmdr_id];
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
            system: {name: null, coord: [0, 0, 0]},
            body: {name: null, r: null, g: null}
        };
        extend(this, cmdr_data);
    }

    touch(data) {
        extend(this, data);
        this._ch = true;
        UNI.broadcast(this.uid, 'cmdr', this);
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


