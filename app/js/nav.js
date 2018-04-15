const NAV = new Vue({
    el: '#nav',
    data: {app: app, nav: {}},
    methods: {
        _upd_status: function (stat) {
            console.log('got one!', stat);
            this.nav = stat;
        }
    }
});

net.on('rec:Status', (status) => { NAV._upd_status(status) });
