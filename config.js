/**
 * Created by swart on 26-Jan-17.
 */
module.exports = {
    main: {
        web_host: 'localhost',
        web_port: 80,
        ws_cmdr: 4201,
        log: true
    },
    db: {
        host: '127.0.0.1',
        port: 27017,
        dbname: 'ed-void',
    },
    client: {
        send_events: ['Status', 'Scan', 'SupercruiseEntry']
    }
};
