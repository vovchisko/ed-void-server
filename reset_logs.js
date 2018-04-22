'use strict';


const cfg = require('./config');
const db = require('./inner_modules/database').current;


db.connect(cfg.db, async () => {



});

process.on('unhandledRejection', error => console.log('ERROR: unhandledRejection', error));
