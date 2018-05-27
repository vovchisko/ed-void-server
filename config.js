module.exports = {
    main: {
        host: 'localhost',
        port: 4200,
        ws_user: 4201,
        ws_journals: 4202,
        rec_log: false
    },
    database: {
        host: '127.0.0.1',
        port: 27017,
        db_void: 'ed-void',
        db_journals: 'ed-void-rec',
    },
    email: {
        service: 'gmail',
        auth: {
            user: 'ed.void.dev@gmail.com',
            pass: 'a68af114ca12d9ccf4cbec53d9affced'
        }
    }
};