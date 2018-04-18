const NAV = new Vue({
    el: '#nav',
    data: {
        app: app,
        surf: false,
        style_ruler: {'background-position-x': 0},
        style_dest: {'background-position-x': 0},
        pos: {lat: 0, lon: 0, alt: 0, head: 0},
        dest: {enabled: true, body: 'MUNDII HZ-32 A 2', lat: 2, lon: 14, azi: 0, dist: 0, align: ''},
    },
    methods: {
        _leave_body: function (ev) { this.pos.body = '' },
        _approach_body: function (ev) {this.pos.body = '' },
        _upd_status: function (stat) {
            this.surf = (typeof stat.Latitude === "number");
            if (!this.surf) return;

            this.pos.alt = stat.Altitude;
            this.pos.head = stat.Heading;
            this.pos.lat = stat.Latitude;
            this.pos.lon = stat.Longitude;
            /**/
            this._update_dest();
        }
    }
});

net.on('rec:Status', (status) => { NAV._upd_status(status) });
net.on('rec:LeaveBody', (ev) => { NAV._leave_body(ev) });
net.on('rec:ApproachSettlement', (ev) => { NAV._approach_body(ev) });
net.on('rec:ApproachBody', (ev) => { NAV._approach_body(ev) });

// ApproachSettlement (get close)
// ApproachBody (closer)
// LeaveBody (leave)