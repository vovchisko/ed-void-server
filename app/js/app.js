"use strict";

Vue.http.options.emulateJSON = true;
Vue.filter('nn', function (num, frac = 3, min_frac = 0) {
    num = parseFloat(num);
    if (isNaN(num) || typeof num !== "number") return 'ERR';
    return (new Intl.NumberFormat('en-US', {
        maximumFractionDigits: frac,
        minimumFractionDigits: min_frac
    })).format(num);
});

Vue.filter('yn', function (value) {
    if (typeof value !== "boolean") return value;
    return value ? 'TRUE' : 'FALSE';
});

Vue.filter('isval', function (value) {
    return value ? value : 'FALSE';
});

const log = console.log;

const net = new Network();

const app = {
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
    tabs: ['user', 'edass', 'nav', 'raw'],
    tab: 'user',
};

/*
 *      MAIN MENU 
 */
const App = new Vue({
    el: '#app',
    data: app,
    methods: {
        _tab: function (tab) {
            this.tab = tab;
        },
        _signup: function () {
            fetch('/signup', {
                headers: {'Content-type': 'application/json'},
                method: 'POST',
                body: JSON.stringify(app.auth)
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
                body: JSON.stringify({email: app.auth.email, pass: app.auth.pass})
            }).then(res => res.json())
                .then((dat) => {
                    if (!dat.result) return Msg.show(dat);
                    localStorage.setItem('atoken', dat.user.atoken);
                    app.auth.atoken = dat.user.atoken;
                    this._net_connect();
                });
        },
        _net_connect: function () {
            net.init(app.auth.atoken);
        },
        _logout: function () {
            app.logged = false;
            app.auth.atoken = '';
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
net.on('_close', (code, reason) => {
    app.online = false;
    if (reason === 'unauthorized' || reason === 'other-client-comes') App._logout();
    if (app.logged || reason === 're-auth') setTimeout(() => App._net_connect(), 500);
});
net.on('welcome', (dat) => {
    app.online = true;
    app.logged = true;
});


document.onreadystatechange = () => {
    if (document.readyState === 'complete') {
        if (app.auth.atoken) { App._net_connect(); }
    }
};