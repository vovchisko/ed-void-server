const CMDR = new Vue({
    el: '#cmdr',
    data: {app: app, cmdr: {name: 'n/a', email: 'n/a', api_key: ''}},
    methods: {
        _logout: function () {App._logout()},
        _upd_cmdr: function (dat) {
            this.cmdr.name = dat.name;
            this.cmdr.email = dat.email;
            this.cmdr.api_key = dat.api_key;
        }
    }
});

net.on('cmdr', (cmdr) => { CMDR._upd_cmdr(cmdr) });
