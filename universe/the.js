'use strict';


exports.dec2hex = function (d, word_len) {
    let hex = Number(d).toString(16);
    word_len = typeof (word_len) === "undefined" || word_len === null ? word_len = 2 : word_len;

    while (hex.length < word_len) {
        hex = "0" + hex;
    }

    return hex.toUpperCase();
};

exports.rnd_from_arr = function (a) {
    return a[Math.floor((Math.random() * a.length << 0))];
};

exports.rnd_from_obj = function (o) {
    const keys = Object.keys(o);
    return this.grid[keys[keys.length * Math.random() << 0]];
};


exports.matrix2d = function (rows = 3, cols = 3, fill = 0) {
    return new Array(rows).fill(0).map(row => new Array(cols).fill(fill));
};

exports.rnd_range = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
};

exports.maybe = function (possibility) {
    return Math.random() < possibility;
};

exports.r = function (n, cut = 1000) {
    return Math.round(n * cut) / cut;
};

exports.r0 = function (n, cut = 1000) {
    let result = Math.round(n * cut) / cut;
    if (result < 1 & result > 0) result = (result + '').substr(1);
    return result;
};

exports.handle_request = function (req, res, cb) {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
        const data = Buffer.concat(chunks);
        cb(req, res, data);
    });
};

