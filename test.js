const moment = require('moment');
function ed_time() {
    return moment().utc().add(1286, 'year');
}


let a = ed_time().format(); // 3304-07-13T13:19:56Z
console.log(a);
