'use strict';

const EDASS = new Vue({
    el: '#edass',
    data: {app: app, scans: []},
    methods: {
        _add_scan: function (rec) {
            for (let i = 0; i < this.scans.length; i++) {
                if (rec.BodyName === this.scans[i].BodyName) {
                    this.scans[i] = rec;
                    return;
                }
            }

            //sort by timestamp
            this.scans.push(rec);
            this.scans.sort((a, b) => {
                //new on top
                if (a.timestamp > b.timestamp) { return -1; }
                if (a.timestamp < b.timestamp) { return 1; }
                return 0;
            });

            // cut
            if (this.scans.length > 50)
                this.scans.splice(-1, 1);
        }
    }
});

net.on('rec:Scan', (rec) => { EDASS._add_scan(rec)});
