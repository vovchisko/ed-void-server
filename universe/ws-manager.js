const WebSocket = require('ws');
const EE3 = require('eventemitter3');

const CLIENT_NOOB = 0;
const CLIENT_VALIDATING = 1;
const CLIENT_VALID = 2;

function parse_json(string) {
    try {
        return JSON.parse(string);
    } catch (e) {
        return null;
    }

}

let log = () => {}//console.log;

class WSM extends EE3 {
    constructor(port) {
        super();
        this.port = port;
        this.clients = {};
        this.auth = function () { throw new Error('Auth function not specified!'); }
    }


    init() {

        let _self = this;

        this.wss = new WebSocket.Server({port: this.port});

        this.wss.on('connection', function (conn) {
            conn.id = null;
            conn.valid_stat = CLIENT_NOOB;

            conn.on('message', function (message) {

                let msg = parse_json(message);
                if (!msg) return conn.close(1000, 'invalid protocol');
                if (conn.valid_stat === CLIENT_VALIDATING) return;
                if (conn.valid_stat === CLIENT_VALID)
                    return _self.emit('message', _self.clients[conn.id], msg.c, msg.dat);

                if (conn.valid_stat === CLIENT_NOOB) {
                    conn.valid_stat = CLIENT_VALIDATING;
                    _self.auth(msg.c, msg.dat, function (id) {
                        if (id) {
                            if (_self.clients[id]) {
                                _self.clients[id].close(1000, 'other-client-comes'); // <-- this client seems previously connected.
                                conn.close(1000, 're-auth'); // <-- this client seems new. but neet to reconnect.
                                return true;

                            } else {
                                conn.id = id;
                                conn.valid_stat = CLIENT_VALID;

                                _self.clients[id] = conn;
                                _self.clients[id].c_send = c_send;
                                _self.emit('connected', _self.clients[id]);
                                _self.clients[id].c_send('welcome');

                            }

                        } else {
                            log('login failed');
                            conn.close(1000, 'unauthorized');
                        }
                    });
                }
            });

            conn.on('close', function () {
                if (conn.id !== null && conn.valid_stat === CLIENT_VALID) {
                    log('@' + conn.id + ' disconnected');
                    _self.emit('disconnected', conn);
                    delete _self.clients[conn.id];
                }
            });
            conn.onerror = function (e) {
                log('ws-err: cc-master.init.clients_wss > ', e.code);
            };

        });


        return this;
    }
}

function c_send(c, dat) {
    if (this.readyState !== WebSocket.OPEN) return console.log('client can`t get msg:', this.id, '; ws-state:', this.readyState);
    let mes = JSON.stringify({c: c, dat: dat});
    this.send(mes);
}


module.exports = WSM;