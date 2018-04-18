/**
 * Created by swart on 26-Jan-17.
 */
module.exports = {
    main: {
        web_host: 'localhost',
        web_port: 80,
        ws_cmdr: 4201,
        rec_log: false,
    },
    db: {
        host: '127.0.0.1',
        port: 27017,
        dbname: 'ed-void',
        allow_unlisted_events: true,
    },
    records: {
        dont_save: ['_Status']
    }
};
