import extend from 'deep-extend';

class DataStorage {
    constructor() {


        this.app = {
            overload: false,
        };


        this.cmdr = {
            name: null,
            system_id: null,
            body_id: null,
            starpos: [0, 0, 0],
            last_rec: null,
            status: {}
        };

        this.navi = {
            style_ruler: {'background-position-x': 0},
            style_dest: {'background-position-x': 0},
            pos: {
                lat: 0, lon: 0, alt: 0, head: 0
            },
            dest: {
                enabled: false,
                lat: 0, lon: 0, head: 0, dist: 0,
                align: ''
            },
            body: {name: null, radius: 0, gravity: 0, c_radius_km: 0}
        };

        this.vass = {
            recent: [],
            exp: {
                total: 0,
                sys_count: 0,
                summ: {s: 0, p: 0, c: 0},
                curr_system: {scanned: 0, total: 0, bodies: {}},
                systems: []
            }
        };


        this.env = {
            system: null,
            body: null,
            station: null,
        };

        this.init();
    }

    init() {


    }

}

const Data = new DataStorage();
export default Data;





