import EventEmitter3 from 'eventemitter3'
import CFG from './cfg'
import MODE from './mode'
import Vue from "vue"
import VARS from '../ctrl/vars'
import {A} from '../components/alert'

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
        A.lock({text: 'connecting to ed-void server'});
        this.ws = new WebSocket('ws://' + window.location.hostname + ':4201');
        this.ws.onopen = () => {
            A.release();
            this.send('auth', CFG.api_key);
        };
        this.ws.onmessage = (msg) => {
            let m = JSON.parse(msg.data);
            if (this.warn_unlistened && !this._events[m.c]) console.warn('master::no_listeners', m.c, m.dat);
            this.emit(m.c, m.dat);
            this.emit('net:any', m.c, m.dat);
            console.log(m.c, m.dat)
        };
        this.ws.onclose = (e) => {
            A.release();
            MODE.is_ready = NS_OFFLINE;
            this.emit('_close', e.code, e.reason);
            if (e.reason) return console.log('ws:ouch!', e.reason);
            A.error({
                text: 'void: network error',
                desc: 'Server not available right now. Please try again later',
                acts: {'re-connect': () => this.init()}
            }, true)
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

    api(method, data, lock = null) {
        if (lock !== false) A.lock({text: VARS.API_PROCESSING_MSG[method] || 'please wait, processing'});
        return fetch('http://' + window.location.hostname + /*(location.port ? ':' + 4200 : '') +*/ '/api/' + method, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {api_key: CFG.api_key || 'none'}
        })
            .then((res) => {
                A.release();
                return res.json().then((obj) => {
                    // console.log(`API: ${method} :: `, obj);
                    return obj;
                });
            })
            .catch((e) => {
                A.release();
                console.log('API-ERR:: ', e);
                throw e
            });
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
    if (user.dev && !MODE.list.includes('dev'))
        MODE.list.push('dev');
});

NET.on('_close', (code, reason) => {
    if (reason === 'unauthorized') {
        MODE.is_ready = false;
        MODE.is_in = false;
        CFG.api_key = '';
        CFG.save();
    }
});

NET.on('uni:alert', (a) => A.add(a));

export default NET;
