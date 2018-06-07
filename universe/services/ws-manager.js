"use strict";


const WebSocket = require('ws');
const EE3 = require('eventemitter3');
const CLIENT_NOOB = 0;
const CLIENT_VALIDATING = 1;
const CLIENT_VALID = 2;
const clog = require('../../clog');

class WSM extends EE3 {
    constructor(port) {
        super();
        this.name = 'WSM';
        this.cpu = 2;
        this.port = port;
        this.clients = {};
        this._logging = false;
        this.auth = function () { throw new Error('Auth function not specified!'); }
    }

    parse_json(string) {
        try {
            return JSON.parse(string);
        } catch (e) {
            clog(this.name, 'JSON-ERROR!', e);
            return null;
        }
    }

    drop_client(id) {
        if (this.clients[id]) {
            for (let i in this.clients[id]._c) {
                this.clients[id]._c[i].close(1000, 'unauthorized');
            }
        }
    }

    init() {

        let _self = this;

        this.wss = new WebSocket.Server({port: this.port});

        this.wss.on('connection', function (conn) {
            conn.id = null;
            conn.valid_stat = CLIENT_NOOB;

            conn.on('message', function (message) {

                let msg = _self.parse_json(message);
                if (!msg) return conn.close(1000, 'invalid protocol');
                if (conn.valid_stat === CLIENT_VALIDATING) return;
                if (conn.valid_stat === CLIENT_VALID)
                    return _self.emit('message', _self.clients[conn.id], msg.c, msg.dat);

                if (conn.valid_stat === CLIENT_NOOB) {
                    conn.valid_stat = CLIENT_VALIDATING;
                    _self.auth(msg.c, msg.dat, function (id) {
                        if (id) {

                            conn.id = id;
                            conn.valid_stat = CLIENT_VALID;

                            if (_self.clients[id]) {
                                if (_self.clients[id]._c.length >= _self.cpu) {
                                    _self.clients[id]._c[0].close(1000, 'other-client-connected');
                                }
                            } else {
                                _self.clients[id] = {
                                    id: id,
                                    _c: [],
                                    c_send: c_send
                                };
                            }

                            _self.clients[id]._c.push(conn);
                            _self.clients[id].c_send('welcome', {connections: _self.clients[id]._c.length});
                            _self.emit('connected', _self.clients[id], _self.clients[id]._c.indexOf(conn));

                            if (_self._logging) clog(_self.name + ` ${conn.id} (${_self.clients[id]._c.length}) one link added`);

                        } else {
                            if (_self._logging) clog(_self.name + 'ws login failed', msg.c, msg.dat);
                            conn.close(1000, 'unauthorized');
                        }
                    });
                }
            });

            conn.on('close', function () {

                if (conn.id !== null && conn.valid_stat === CLIENT_VALID) {
                    let i_disc = _self.clients[conn.id]._c.indexOf(conn);
                    _self.clients[conn.id]._c.splice(i_disc, 1);

                    if (_self._logging) clog(_self.name + ` ${conn.id} (${_self.clients[conn.id]._c.length}) one link lost`);

                    if (!_self.clients[conn.id]._c.length) {
                        _self.emit('disconnected', conn);
                        delete _self.clients[conn.id];
                    }
                }
            });
            conn.onerror = function (e) {
                if (_self._logging) clog(_self.name + 'ws-err: cc-master.init.clients_wss > ', e.code);
            };

        });


        return this;
    }
}

function c_send(c, dat) {
    for (let i = 0; i < this._c.length; i++) {
        if (this._c[i].readyState !== WebSocket.OPEN) continue;
        let mes = JSON.stringify({c: c, dat: dat});
        this._c[i].send(mes);
    }
}

module.exports = WSM;



