'use strict';

const EDASS = new Vue({
    el: '#ed-ass',
    data: {app: app, scans: []},
    methods: {
        _add_scan: function (rec) {
            if (rec.__from_history) {
                this.scans.push(rec);
            } else {
                this.scans.unshift(rec);
            }
        }
    }
});

net.on('rec:Scan', (rec) => { EDASS._add_scan(rec)});
