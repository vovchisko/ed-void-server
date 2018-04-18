const NAV = new Vue({
    el: '#nav',
    data: {
        app: app,
        surf: false,
        style_ruler: {'background-position-x': 0},
        style_dest: {'background-position-x': 0},
        pos: {lat: 0, lon: 0, alt: 0, head: 0},
        dest: {enabled: false, lat: 0, lon: 0, azi: 0, dist: 0, align: '', body_radius: 1200},
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
        },
        _update_dest: function () {
            if (this.dest.enabled) {
                let latStart = this.pos.lat * Math.PI / 180;
                let lonStart = this.pos.lon * Math.PI / 180;
                let latDest = this.dest.lat * Math.PI / 180;
                let lonDest = this.dest.lon * Math.PI / 180;
                let deltaLon = lonDest - lonStart;
                let deltaLat = Math.log(Math.tan(Math.PI / 4 + latDest / 2) / Math.tan(Math.PI / 4 + latStart / 2));
                let initialBearing = (Math.atan2(deltaLon, deltaLat)) * (180 / Math.PI);
                if (initialBearing < 0) initialBearing = 360 + initialBearing;
                this.dest.dist = Math.acos(Math.sin(latStart) * Math.sin(latDest) + Math.cos(latStart) * Math.cos(latDest) * Math.cos(deltaLon)) * this.dest.body_radius;
                this.dest.head = Math.floor(initialBearing);
                isNaN(this.dest.head) ? this.dest.head = 'ERR' : null;
            }

            if (this.$refs) {
                if (this.$refs.ruler) {
                    let rw = this.$refs.ruler.clientWidth;
                    let offset = (rw / 2) - this.pos.head * 4;
                    this.style_ruler['background-position-x'] = offset + 'px';

                    if (this.dest.enabled && this.$refs.dest) {

                        let odest = (rw / 2) - (this.pos.head - this.dest.head) * 4;
                        this.style_dest['background-position-x'] = odest + 'px';

                        let alg = Math.abs(this.dest.head - this.pos.head);

                        if (alg <= 3) this.dest.align = 'alg0';
                        if (alg > 3) this.dest.align = 'alg1';
                        if (alg > 10) this.dest.align = 'alg2';
                    }
                }
            }
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