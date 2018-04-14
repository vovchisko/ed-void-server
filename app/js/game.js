"use strict";

Vue.http.options.emulateJSON = true;

const log = console.log;

const net = new Network();

const game = {
    logged: false,
    online: false,
    auth: {
        _sign: 'in',
        name: '',
        email: window.location.hash.substr(1) || '',
        pass: '',
        pass_c: '',
        atoken: localStorage.getItem('atoken') || ''
    },
    cmdr: {},
    show_config: false,
};

/*
 *      MAIN MENU 
 */
const Vue_App = new Vue({
    el: '#app',
    data: game,
    methods: {
        _toggle_config() {
            game.show_config = !game.show_config;
        },
        _signup: function () {
            fetch('/signup', {
                headers: {'Content-type': 'application/json'},
                method: 'POST',
                body: JSON.stringify(game.auth)
            }).then((res) => {return res.json();})
                .then((dat) => {
                    if (!dat.result) return Msg.show(dat);
                    this._signin();
                });
        },
        _signin: function () {
            fetch('/signin', {
                headers: {'Content-type': 'application/json'},
                method: 'POST',
                body: JSON.stringify({email: game.auth.email, pass: game.auth.pass})
            }).then(res => res.json())
                .then((dat) => {
                    if (!dat.result) return Msg.show(dat);
                    localStorage.setItem('atoken', dat.cmdr.atoken);
                    game.auth.atoken = dat.cmdr.atoken;
                    game.auth.pass = '';
                    this._net_connect();
                });

        },
        _net_connect: function () {
            net.init(game.auth.atoken);
        },
        _logout: function () {
            game.logged = false;
            game.auth.atoken = '';
            localStorage.removeItem('atoken');
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


/*
 *          NETWORK
 */
net.on('_close', (reason) => {
    game.online = false;
    if (game.logged) setTimeout(() => Vue_App._net_connect(), 1000);
});
net.on('welcome', (dat) => {
    game.online = true;
    game.logged = true;
});

net.on('cmdr', (cmdr) => {
    game.cmdr.name = cmdr.name;
    game.cmdr.email = cmdr.email;
    game.cmdr.api_key = cmdr.api_key;
});


if (game.auth.atoken) { Vue_App._net_connect(); }