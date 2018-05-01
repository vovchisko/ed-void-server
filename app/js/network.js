class Network extends EventEmitter {

    constructor() {
        super();
        this.warn_unlistened = false;
        this.ws = null;
        this.wtoken = null;
    }


    init(wtoken) {
        const _net = this;

        this.ws = new WebSocket('ws://' + window.location.hostname + ':4201');

        this.ws.onopen = function () {
            _net.wtoken = wtoken;
            _net.send('auth', _net.wtoken);
            console.info('net::auth:', _net.wtoken);
        };

        this.ws.onmessage = function (msg) {
            let m = JSON.parse(msg.data);
            if (net.warn_unlistened && !_net._events[m.c]) console.warn('master::no_listeners', m.c, m.dat);
            _net.emit(m.c, m.dat);
            _net.emit('net:any', m);
        };
        this.ws.onclose = function (e) {
            _net.emit('_close', e.code, e.reason);
            console.info('net:_close', e.code, e.reason, e);

        };

        this.ws.onerror = function (err) {
            _net.emit('_error', err);
            _net.ws = null;
            console.info('net:_error', err);
        }
    };

    disconnect() {
        if (this.ws !== null) this.ws.close(1000, 'logout');
    };

    send(c, dat) {
        if (!this.ws) return false;
        let m = JSON.stringify({c: c, dat: dat});
        this.ws.send(m);
    };


}





