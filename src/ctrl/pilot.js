import NET from './network'
import Vue from 'vue'
import extend from 'deep-extend'

const PILOT = {
    cmdr: {
        name: null,
        sys_id: null,
        body_id: null,
        starpos: [0, 0, 0],
        last_rec: null,
    },
    status: {
        flags: 0,
        pips: [0, 0, 0],
        fgroup: 0,
        lat: null,
        lon: null,
        alt: null,
        head: null,
        focus: null,
    },
    dest: {
        enabled: false,
        goal: null,
        lat: null, lon: null, alt:null, head: null, dist: null, r: null,
        sys_id: null,
        body_id: null,
        st_id: null,
        f: '',
        x: 0,
    },
    env: {body: null, system: null, station: null},
    exp_data: {},
    dest_clear: function () {
        extend(this.dest, {
            enabled: false,
            goal: null,
            lat: null, lon: null, head: null, dist: null, r: null,
            sys_id: null,
            body_id: null,
            st_id: null,
            f: '',
            x: 0,
        });
    },
    dest_set(dest) {
        this.dest_clear();
        extend(this.dest, dest)
    }
};

NET.on('uni:dest-set', (dest) => PILOT.dest_set(dest));
NET.on('uni:dest', (dest) => extend(PILOT.dest, dest));
NET.on('uni:cmdr', (cmdr) => extend(PILOT.cmdr, cmdr));
NET.on('uni:status', (status) => extend(PILOT.status, status));
NET.on('uni:c_system', (system) => Vue.set(PILOT.env, 'system', system));
NET.on('uni:c_body', (body) => Vue.set(PILOT.env, 'body', body));
NET.on('uni:c_station', (station) => Vue.set(PILOT.env, 'station', station));

export default PILOT;