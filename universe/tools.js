const SOL_RADIUS = 695700000; //meters
const SOL_MASS_GT = 1.98855 * Math.pow(10, 18); // (1.98855±0.00025)×10^30 kg :: ^30-kg ^27-t ^24-kt ^21-mt ^18-gt
const EARTH_MASS_GT = 5.9722 * Math.pow(10, 12); // (5.9722±0.0006)×10^24 kg kg :: ^24-kg ^21-t ^18-kt ^15-mt ^12-gt
const MOON_MASS_GT = 7.342 * Math.pow(10, 10); // 7.342×10^22 kg :: ^22-kg ^19-t ^16-kt ^13-mt ^10-gt
const GRAVITY_CONST = 9.80665;
const AU = 149597870700; //m?

const convert = {

    UP_CASE(x) {
        return x.toUpperCase();
    },
    LOW_CASE(x) {
        return x.toLowerCase();
    },
    ED_ID(x) {
        return x.toLowerCase().replace(/ /g, '_');
    },

    toBool(x) {
        return !!x;
    },

    Pascal2ATM: function (p) {
        return p / 101325;
    },

    meter2SolRadius(m) {
        return m / SOL_RADIUS;
    },

    m2AU: function (m) {
        return m / AU;
    },

    m2Km: function (meters) {
        return meters / 1000;
    },

    MT2GT: function (MT) {
        return MT / 1000;
    },

    Sol2GT: function (SolMass) {
        return SolMass * SOL_MASS_GT;
    },

    Moon2GT: function (MoonMass) {
        return MoonMass * MOON_MASS_GT;
    },

    Earth2GT: function (EMass) {
        return EMass * EARTH_MASS_GT;
    },

    GF2Gravity: function (gf) {
        return gf / GRAVITY_CONST;
    },

};

function checksum(s) {
    return (s.split("").reduce(function (a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a
    }, 0) + 2147483647) + 1;
}

function pick(A, a, B, b, func = null, even_undef = false) {
    if (typeof A[a] === 'undefined' && !even_undef) return;
    if (typeof func === 'function') {
        B[b] = func(A[a]);
    } else {
        B[b] = A[a];
    }
    return B;
}

function pickx(A, B) {
    let fields = [...arguments].slice(2);
    for (let i in fields) {
        pick(A, fields[i][0], B, fields[i][1], fields[i][2], fields[i][3]);
    }
    return B;
}

function is_valid_email(email) {
    let re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return re.test(email);
}

function recout(rec) {
    //delete rec._id; << don't remove it! we use it!
    delete rec._lng;
    delete rec._gv;
    if (rec.event === 'Scan') recout_Scan(rec);
    return rec;
}

function recout_Scan(rec) {
    if (rec.ScanType === 'Detailed') rec._est = estimate_scan(rec);
}


function estimate_scan(scan) {
    if (scan.StarType) return est_star(scan.StarType, scan.StellarMass);
    if (scan.PlanetClass) return est_planet(scan.PlanetClass, scan.MassEM, !!scan.TerraformState);
    return 0;
}

const STAR_DWARVES = " D DA DAB DAO DAZ DAV DB DBZ DBV DO DOV DQ DC DCV DX "; //33737
const STAR_DENSE = " N  H "; //54309
const SAG_A_TYPE = "SupermassiveBlackHole"; //special price


function est_star(type, mass) {
    let baseval = 2880;
    if (STAR_DWARVES.includes(' ' + type + ' ')) baseval = 33737;
    if (STAR_DENSE.includes(' ' + type + ' ')) baseval = 54309;
    if (SAG_A_TYPE === type) return 628318;
    return Math.floor(baseval + (mass * baseval / 66.25));
}

function est_planet(type, mass, terra) {
    let baseval = 0;
    let bonusval = 0;
    switch (type.toLowerCase()) {
        case 'metal rich body':
            baseval = 52292;
            break;
        case 'high metal content body':
        case 'sudarsky class ii gas giant':
            baseval = 23168;
            if (terra) bonusval = 241607;
            break;
        case 'earthlike body':
        case 'earth-like world':
            baseval = 155581;
            bonusval = 279088;
            break;
        case 'water world':
            baseval = 155581;
            if (terra) bonusval = 279088;
            break;
        case 'ammonia world':
            baseval = 232619;
            break;
        case 'sudarsky class i gas giant':
            baseval = 3974;
            break;
        default:
            baseval = 720;
            if (terra) bonusval = 223971;
            break;
    }
    let value = baseval + (3 * baseval * Math.pow(mass, 0.199977) / 5.3);
    if (bonusval > 0)
        value += bonusval + (3 * bonusval * Math.pow(mass, 0.199977) / 5.3);

    return Math.floor(value);
}

function scan_obj_type(Scan) {
    if (Scan.ScanType === 'Detailed') {
        if (Scan.StarType) return 'star';
        if (Scan.PlanetClass) return 'planet';
    } else if (Scan.ScanType === 'Basic') {
        if (Scan.Parents && Scan.Parents[0] && Scan.Parents[0].Ring) return 'cluster';
    }
    return null;
}

/**
 * Check if line intersect with a circle
 *
 * @param x0 {number} circle center X
 * @param y0 {number} curcle center Y
 * @param r {number} curcle radius
 * @param x1 {number} point A X
 * @param y1 {number} point A Y
 * @param x2 {number} point B X
 * @param y2 {number} point B Y
 *
 * @returns {boolean}
 */
function circle_intersect(x0, y0, r, // center and radius of circle
                          x1, y1,    // point A
                          x2, y2     // point B
) {
    let q = x0 * x0 + y0 * y0 - r * r;
    let k = -2.0 * x0;
    let l = -2.0 * y0;

    let z = x1 * y2 - x2 * y1;
    let p = y1 - y2;
    let s = x1 - x2;

    let A = s * s + p * p;
    let B = s * s * k + 2.0 * z * p + s * l * p;
    let C = q * s * s + z * z + s * l * z;

    let D = B * B - 4.0 * A * C;

    return D >= 0.0;

}

function safe_regexp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function not_nulled(obj) {
    let ret = {};
    for (let i in obj) {
        if (obj[i] !== null) ret[i] = obj[i];
    }
    return ret;
}

function now(ms = false) {
    return ms ? Date.now() / 1000 : Date.now();
}

function item_in(arr, prop, val, cb) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i][prop] === val) {
            if(typeof cb === 'function') cb(arr[i], i)
            return arr[i];
        }
    }
}

module.exports.item_in = item_in;
module.exports.not_nulled = not_nulled;
module.exports.safe_regexp = safe_regexp;
module.exports.circle_intersect = circle_intersect;
module.exports.scan_obj_type = scan_obj_type;
module.exports.recout = recout;
module.exports.est_star = est_star;
module.exports.est_planet = est_planet;
module.exports.estimate_scan = estimate_scan;
module.exports.is_valid_email = is_valid_email;
module.exports.pick = pick;
module.exports.pickx = pickx;
module.exports.checksum = checksum;
module.exports.convert = convert;
