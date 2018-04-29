const RAW = new Vue({
    el: '#raw',
    data: {
        app: app,
        raw: [],
        status: {}
    },
    methods: {
        _push_raw: function (m) {
            if (m.dat.event === 'Status') {
                Vue.set(this, 'status', m.dat)

            } else {

                this.raw.unshift(m);
                if (this.raw.length > 50)
                    this.raw.splice(-1, 1);
            }

        }
    }
});

net.on('net:any', (m) => { RAW._push_raw(m) });