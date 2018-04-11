class Network extends EventEmitter {

    constructor() {
        super();

        this.ws = null;
        this.auth = {
            email: '',
            pass: ''
        };
    }


    init(email, pass) {
        const _net = this;

        this.ws = new WebSocket('ws://' + window.location.hostname + ':4200');

        this.ws.onopen = function () {
            _net.auth.email = email;
            _net.auth.pass = pass;
            _net.send('auth', _net.auth);
        };

        this.ws.onmessage = function (msg) {
            let m = JSON.parse(msg.data);
            if (!_net._events[m.c]) console.warn('master::no_listeners', m.c, m.dat);
            _net.emit(m.c, m.dat);
        };
        this.ws.onclose = function (e) {
            _net.emit('_close', e.code, e.reason);
        };

        this.ws.onerror = function (err) {
            _net.emit('_error', err);
            _net.ws = null;
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





