let d = new Date('2018-04-18 23:38:18.000Z');

let dateformat = require('dateformat');

//console.log(df(d, 'yy:dd:mm/hh:mm:ss'));
console.log(dateformat(new Date('2017-12-05 20:21:12.000Z'), 'yymmddHHMMss', true));
console.log(dateformat(new Date('2017-12-05 20:21:12.000Z'), 'yy mm dd HH MM ss'));
//console.log(df(new Date(), 'yy:mm:dd/HH:MM:ss'));