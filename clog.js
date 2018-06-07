const dateformat = require('dateformat');

module.exports = function clog() {
    let pre = ' ';
    for (let i in arguments) if (typeof arguments[i] === 'object' || typeof arguments[i] === 'array') pre = ' \n';
        console.log(dateformat(new Date(Date.now()), 'yy/mm/dd#HH:MM:ss' + pre, true),
            ...arguments);
};