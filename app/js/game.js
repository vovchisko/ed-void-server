"use strict";

Vue.http.options.emulateJSON = true;

const log = console.log;


const net = new Network();

const game = {
    state: 0,
    auth: {
        _sign: 'in',
        name: '',
        email: window.location.hash.substr(1) || '',
        pass: '',
        pass_c: '',
    },
    cmdr: {},
};


/* 
 *      MAIN MENU 
 */
const Vue_App = new Vue({
    el: '#app',
    data: game,
    methods: {
        _signup: function () {
            fetch('/signup', {
                headers: {'Content-type': 'application/json'},
                method: 'POST',
                body: JSON.stringify(game.auth)
            }).then((res) => {return res.json();})
                .then((dat) => {
                    if (dat.result) return this._signin();
                    Msg.show(dat);
                }).catch((err) => {});

        },
        _signin: function () {
            net.init(this.auth.email, this.auth.pass);
        },
        _logout: function () {
            net.disconnect();
        },

    }
});

const Msg = new Vue({
    el: '#msg',
    data: {cdw: 0, t: null, type: 'none', text: 'wait, what?'},
    methods: {
        show: function (msg) {
            if (typeof msg === 'string') {
                this.type = 'none';
                this.text = msg;
            } else {
                this.type = msg.type;
                this.text = msg.text;
            }
            if (this.t === null) this.t = setInterval(() => { if (this.cdw > 0) this.cdw--; }, 400);
            this.cdw = 10;
        }
    }
});


const Panel = new Vue({
    el: '#panel',
    data: game,
    methods: {}
});

/*
 *          NETWORK
 */
net.on('_error', (error) => console.error('_error', error));
net.on('_close', (core, reason) => {
    game.state = 0;
    game.auth._sign = 'in';
});
net.on('welcome', () => { game.state = 1 });
net.on('cmdr', (dat) => {
    for (let i in dat) Vue.set(game.cmdr, i, dat[i]);
    console.log(game.cmdr)
});
