const moment = require('moment');

function ed_time() {
    return moment().utc().add(1286, 'year');
}


let a = ed_time().format(); // 3304-07-13T13:19:56Z
console.log(a);

let pilots = {
    'dude0': {p: 4, time: 11},
    'dude1': {p: 15, time: 21},
    'dude2': {p: 15, time: 23},
    'dude3': {p: 14, time: 12},

}

function re_arrange() {

    let chart = [];
    for (let i in pilots) {
        chart.push({
            _id: i,
            order: pilots[i].p - (1 * ('0.' + pilots[i].time)) //checkpoint minus fraction time (less time minused - higher position)
        });
    }

    chart.sort((a, b) => b.order - a.order);

    for (let i in pilots) {
        pilots[i].pos = i + 1;
    }
    console.log(pilots);
    console.log(chart);
}

re_arrange();



console.log('/////');



const homedir = require('os').homedir();
console.log(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME']);
console.log(homedir);
console.log(process.env);