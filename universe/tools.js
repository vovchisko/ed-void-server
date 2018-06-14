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
}

function pickx(A, B) {
    let fields = [...arguments].slice(2);
    for (let i in fields) {
        pick(A, fields[i][0], B, fields[i][1], fields[i][2], fields[i][3]);
    }
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
