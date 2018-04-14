const CMDR = new Vue({
    el: '#cmdr',
    data: {app: app, cmdr: {}},
    methods: {
        _logout: function () {App._logout()},
        _upd_cmdr: function (dat) {
            Vue.set(this.cmdr, 'name', dat.name);
            Vue.set(this.cmdr, 'email', dat.email);
            Vue.set(this.cmdr, 'api_key', dat.api_key);
        }
    }
});

net.on('cmdr', (cmdr) => { CMDR._upd_cmdr(cmdr) });
