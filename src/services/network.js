import EventEmitter3 from 'eventemitter3';

const NS_OFFLINE = 'offline';
const NS_CONNECTING = 'connecting';
const NS_ONLINE = 'online';

class Network extends EventEmitter3 {

    constructor() {
        super();
        this.warn_unlistened = false;
        this.ws = null;
        this.wtoken = null;
        this.stat = {online: NS_OFFLINE, error: false};
        this.timer = null;
    }

    init(wtoken) {
        const _net = this;
        this.ws = new WebSocket('ws://' + window.location.hostname + ':4201');
        this.stat.online = NS_CONNECTING;

        this.ws.onopen = function () {
            _net.wtoken = wtoken;
            _net.send('auth', _net.wtoken);
            _net.stat.online = NS_ONLINE;
            _net.stat.error = false;
        };

        this.ws.onmessage = function (msg) {
            let m = JSON.parse(msg.data);
            if (this.warn_unlistened && !_net._events[m.c]) console.warn('master::no_listeners', m.c, m.dat);
            _net.emit(m.c, m.dat);
            _net.emit('net:any', m);
        };

        this.ws.onclose = function (e) {
            _net.emit('_close', e.code, e.reason);
            _net.stat.online = NS_OFFLINE;
            if (e.reason) return;
            _net.stat.error = true;
            _net.timer = setTimeout(() => _net.init(_net.wtoken), 1000);
        };

        this.ws.onerror = function (err) {
            _net.stat.error = true;
            _net.emit('_error', err);
            _net.ws = null;
        }
    };

    disconnect() {
        if (this.ws !== null) this.ws.close(1000, 'logout');
        if (this.timer) clearTimeout(this.timer)
    };

    send(c, dat) {
        if (!this.ws) return false;
        let m = JSON.stringify({c: c, dat: dat});
        this.ws.send(m);
    };


    api(method, data) {
        return fetch('http://' + window.location.hostname + ':4200/api/' + method, {
            method: 'POST',
            body: JSON.stringify(data)
        }).then((res) => res.json());
    }

}

const Net = new Network();

export default Net;
