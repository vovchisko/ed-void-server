const USER = new Vue({
    el: '#user',
    data: {app: app, user: {email: 'n/a', api_key: ''}, cmdr: {name: 'n/a', system: 'n/a', body: 'n/a'}},
    methods: {
        _logout: function () {App._logout()},
        _upd_user: function (dat) {
            this.user.email = dat.email;
            this.user.api_key = dat.api_key;
        },
        _upd_cmdr: function (dat) {
            this.cmdr.name = dat.name;
            this.cmdr.system = dat.system;
            this.cmdr.body = dat.body;
        }
    }
});

net.on('cmdr', (cmdr) => { USER._upd_cmdr(cmdr) });
net.on('user', (user) => { USER._upd_user(user) });
