const extend = require('deep-extend');
const clog = require('../clog');
const tools = require('./tools');

let UNI;
let DB;

/**
 * init SYSTEM module
 * @param uni {Universe}
 * @param db {Database}
 * @returns {BODY}
 */
module.exports.init = function (uni, db) {
    UNI = uni;
    DB = db;
    return BODY;
};


class BODY {
    constructor(body) {
        this._id = null;
        this.name = null;
        this.type = null;
        this.submited = null;
        this.discovered = null;
        this.upd = 0;
        extend(this, body);
    }

    append(cmdr, rec) {

        this.type = tools.scan_obj_type(rec);

        tools.pickx(rec, this,
            ['BodyName', 'name', tools.convert.LOW_CASE],
            ['BodyName', 'name_raw'],
            ['BodyID', 'body_id'],
            ['DistanceFromArrivalLS', 'arrival'],
            ['Radius', 'radius'],

            //starts
            ['Luminosity', 'luminosity'],
            ['StarType', 'class'],
            ['AbsoluteMagnitude', 'star_absm'],
            ['Age_MY', 'age'],
            ['StellarMass', 'mass', tools.convert.Sol2GT],

            //planets
            ['Landable', 'landable', tools.convert.toBool, true],
            ['PlanetClass', 'class'],
            ['MassEM', 'mass', tools.convert.Earth2GT],
            ['SurfaceGravity', 'surf_gravity', tools.convert.GF2Gravity],
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

        if (!this.submited) this.submited = cmdr.name;
        if (this.upd < rec.timestamp) this.upd = rec.timestamp;

        return this.save();
    }

    async save() {
        //no temporary fields here...
        await DB.bodies.save(this);
    }
}
