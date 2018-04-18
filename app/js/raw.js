const RAW = new Vue({
    el: '#raw',
    data: {
        app: app,
        raw: [],
    },
    methods: {
        _push_raw: function (rec) {
            this.raw.unshift(rec);
            if (this.raw.length > 20)
                this.raw.splice(-1, 1);
        }
    }
});

net.on('rec:any', (rec) => { RAW._push_raw(rec) });