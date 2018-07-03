import NET from './network'
import Vue from 'vue'
import extend from 'deep-extend'

const PILOT = {
    cmdr: {
        name: null,
        system_id: null,
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
    },
    dest: {
        enabled: false,
        lat: 0, lon: 0, head: 0, dist: 0,
    },
    env: {body: null, system: null, station: null},
    exp_data: {},
};

NET.on('uni:dest', (dat) => extend(PILOT.dest, dat));
NET.on('uni:cmdr', (dat) => extend(PILOT.cmdr, dat));
NET.on('uni:status', (dat) => extend(PILOT.status, dat));
NET.on('uni:c_system', (dat) => Vue.set(PILOT.env, 'system', dat));
NET.on('uni:c_body', (dat) => Vue.set(PILOT.env, 'body', dat));

export default PILOT;