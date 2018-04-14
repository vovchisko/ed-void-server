'use strict';

const EDASS = new Vue({
    el: '#ed-ass',
    data: {app: app, scans: []},
    methods: {
        _add_scan: function (rec) {
            this.scans.unshift(rec);
        }
    }
});

net.on('rec:Scan', (rec) => { EDASS._add_scan(rec)});
