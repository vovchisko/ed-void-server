const RAW = new Vue({
    el: '#raw',
    data: {
        app: app,
        raw: [],
    },
    methods: {
        _push_raw: function (rec) { this.raw.unshift(rec); }
    }
});

net.on('rec:any', (rec) => { RAW._push_raw(rec) });