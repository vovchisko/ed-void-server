const db = require('./inner_modules/database').current;
const EE = require('eventemitter3');
const extend = require('deep-extend');

class Universe extends EE {
    constructor() {
        super();
        this.cmdrs = {};
        this.cmdrs_api_key = {};
    }

    async get_cmdr(by) {
        let cmdr = null;
        if (by.id && this.cmdrs[by.id]) {
            return this.cmdrs[by.id];
        } else {
            let dat = await db.cmrds.findOne(by);
            if (dat) {
                if (this.cmdrs[dat.id]) return this.cmdrs[dat.id]; //already loaded
                cmdr = new CMDR(dat);
                this.cmdrs[cmdr.id] = cmdr;
                this.cmdrs_api_key[cmdr.api_key] = cmdr;
                return cmdr;
            }
        }
        return cmdr;
    }
}

const uni = new Universe();

class CMDR {
    constructor(data) {
        extend(this, data);
    }

    save() {
        db.cmdrs.save(this);
    }
}

module.exports = uni;