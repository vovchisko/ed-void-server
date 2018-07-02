import EventEmitter3 from 'eventemitter3';
import CFG from './cfg';
import MODE from './mode';
import Vue from "vue";

const NS_OFFLINE = false;
const NS_CONNECTING = null;
const NS_ONLINE = true;

class Network extends EventEmitter3 {

    constructor() {
        super();
        this.warn_unlistened = false;
        this.ws = null;
        this.timer = null;
        MODE.is_ready = NS_OFFLINE;
        MODE.is_in = !!CFG.api_key;
    }

    init() {
        this.ws = new WebSocket('ws://' + window.location.hostname + ':4201');
        this.ws.onopen = () => {
            this.send('auth', CFG.api_key);
        };
        this.ws.onmessage = (msg) => {
            let m = JSON.parse(msg.data);
            if (this.warn_unlistened && !this._events[m.c]) console.warn('master::no_listeners', m.c, m.dat);
            this.emit(m.c, m.dat);
            this.emit('net:any', m.c, m.dat);
        };
        this.ws.onclose = (e) => {
            MODE.is_ready = NS_OFFLINE;
            this.emit('_close', e.code, e.reason);
            if (e.reason) return console.log('ws:ouch!', e.reason);
            this.timer = setTimeout(() => this.init(), 2000);
        };
        this.ws.onerror = (err) => {
            this.emit('_error', err);
            this.ws = null;
        };
        MODE.is_ready = NS_CONNECTING;
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
        return fetch('http://' + window.location.hostname + /*(location.port ? ':' + 4200 : '') +*/ '/api/' + method, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {api_key: CFG.api_key || 'none'}
        })
            .then((res) => {
                return res.json().then((obj) => {
                    console.log(`API: ${method} :: `, obj);
                    return obj;
                });

            })
            .catch((e) => {console.log('ED-NET:: ', e)});
    }

}

const NET = new Network();

NET.on('uni:user', (user) => {
    CFG.email = user.email;
    CFG.api_key = user.api_key;
    CFG.valid = user.valid;
    CFG.dev = user.dev;
    MODE.is_in = true;
    MODE.is_ready = NS_ONLINE;
    if (user.dev)
        Vue.set(MODE.list, 'dev', 'dev');

});

NET.on('_close', (code, reason) => {
    if (reason === 'unauthorized') {
        CFG.api_key = '';
        CFG.save();
    }
});

export default NET;
