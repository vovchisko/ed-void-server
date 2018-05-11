const SOL_RADIUS = 695700000; //meters
const SOL_MASS_GT = 1.98855 * Math.pow(10, 18); // (1.98855±0.00025)×10^30 kg :: ^30-kg ^27-t ^24-kt ^21-mt ^18-gt
const EARTH_MASS_GT = 5.9722 * Math.pow(10, 12); // (5.9722±0.0006)×10^24 kg kg :: ^24-kg ^21-t ^18-kt ^15-mt ^12-gt
const MOON_MASS_GT = 7.342 * Math.pow(10, 10); // 7.342×10^22 kg :: ^22-kg ^19-t ^16-kt ^13-mt ^10-gt
const GRAVITY_CONST = 9.80665;
const AU = 149597870700; //m?

const convert = {

    toBool(x) {
        return !!x;
    },

    Pascal2ATM: function (p) {
        return p / 101325
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


module.exports.pick = pick;
module.exports.pickx = pickx;
module.exports.checksum = checksum;
module.exports.convert = convert;