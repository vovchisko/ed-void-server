'use strict';

module.exports = {

    process: function (rec) {
        if (rec.event === 'Scan') this.Scan(rec);
    },

    _Scan_PlanetK: {
        "Ammonia world": 232619,
        "Earthlike body": 155581,
        "Water world": 155581,
        "Metal rich body": 52292,
        "High metal content body": 23168,
        "Sudarsky class II gas giant": 23168,
        "Sudarsky class I gas giant": 3974,
    },

    _Scan_PlanetTerrBonus: {
        "Earthlike body": 279088,
        "Water world": 279088,
        "High metal content body": 241607,
        "Rocky body": 223971,
    },


    _Scan_StarK: {
        " D DA DAB DAO DAZ DAV DB DBZ DBV DO DOV DQ DC DCV DX ": 33737,
        " N  H ": 54309,
    },

    Scan: function (rec) {
        // Estimate Body Value
        // starts : k + (m * k / 66.25)
        // worlds : k + ( 3 * k * m0.199977 / 5.3 )
        if (rec.ScanType !== 'Detailed' || (!rec.PlanetClass && !rec.StarType)) return;

        if (rec.PlanetClass) {
            let k = this._Scan_PlanetK[rec.PlanetClass] || 720;
            rec.EstimatedValue = k + (3 * k * Math.pow(rec.MassEM, 0.199977) / 5.3);
            if (rec.TerraformState && this._Scan_PlanetTerrBonus[rec.PlanetClass]) {
                rec.EstimatedValue += this._Scan_PlanetTerrBonus[rec.PlanetClass];
            }
        }

        if (rec.StarType) {
            let k = 2880;
            for (let types in this._Scan_StarK) if (types.includes(' ' + rec.StarType + ' ')) k = this._Scan_StarK[types];
            rec.EstimatedValue = k + (rec.StellarMass * k / 66.25);
        }

        if (rec.EstimatedValue) rec.EstimatedValue = Math.floor(rec.EstimatedValue);
    }
};
