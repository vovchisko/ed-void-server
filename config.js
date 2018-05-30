module.exports = {};

module.exports.main = {
    host: 'localhost',
    port: 80,
    ws_user: 4201,
    ws_journals: 4202,
    rec_log: false
};

module.exports.database = {
    host: '127.0.0.1',
    port: 27017,
    db_void: 'ed-void',
    db_journals: 'ed-void-rec',
};

module.exports.email = {
    domain: module.exports.main.host,
    service: 'gmail',
    auth: {
        user: 'ed.void.dev@gmail.com',
        pass: 'a68af114ca12d9ccf4cbec53d9affced'
    }
};