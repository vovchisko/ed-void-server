const USER = new Vue({
    el: '#user',
    data: {
        app: app,
        user: {email: 'n/a', api_key: ''},
        cmdr: {
            name: 'n/a',
            loc: {
                system: {name: null},
                body: {scanned: false, name: null, g: 0, r: 0}
            }
        }
    },
    methods: {
        _logout: function () {App._logout()},
        _upd_user: function (dat) {
            this.user.email = dat.email;
            this.user.api_key = dat.api_key;
        },
        _upd_cmdr: function (dat) {
            this.cmdr.name = dat.name;
            Vue.set(this.cmdr, 'loc', dat.loc);
            console.log(dat)
        }
    }
});

net.on('cmdr', (cmdr) => { USER._upd_cmdr(cmdr) });
net.on('user', (user) => { USER._upd_user(user) });
