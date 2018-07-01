//import Net from './network';

import extend from 'deep-extend';

class DataStorage {
    constructor() {
        this._null = {};

        this.app = {
            overload: false,
        };

        this.cfg = {
            ui_font_size: '100%',
            ui_fx_level: 'full',

        };

        this.modes = {
            modes: {
                'cmdr': 'cmdr',
                'navi': 'nav',
                'vass': 'scan',
                'repo': 'poi',
                'cfg': 'cfg',
            },
            c_mode: 'cmdr'
        };

        this.repo = {
            curr: {
                _id: null,

                //user can edit
                type: 'NA',
                sub_type: null,
                subject: '',
                description: '',
                links: [],
                screens: {
                    cockpit: '',
                    sys_map: ''
                }, //required

                system: null,
                body: null,
                lat: null,
                lon: null,
                reporter: null,
                pub: false, //other peopl can find it
                locked: false, //report confirmed nad locked

                //user can't edit
                parent_id: null, //for a few reports in the same place
                starpos: [0, 0, 0],
                system_id: null,
                body_id: null,
                reported: null,
                updated: null,

            },
            reports_count: null,
            reports: [],

        };

        this.auth = {
            is_logged: false,
            email: '',
            pass: '',
        };

        this.cmdr = {
            name: null,
            system_id: null,
            body_id: null,
            starpos: [0, 0, 0],
            last_rec: null,
            status: {}
        };

        this.user = {
            email: 'n/a',
            api_key: 'n/a',
            valid: null,
            dev: false,
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

        for (let i in this) {
            if (i[0] !== '_') {
                this._null[i] = {};
                extend(this._null[i], this[i])
            }
        }

    }

    nullify(section) {
        if (section === 'repo.curr') extend(this.repo.curr, this._null.repo.curr);
    }

}

const Data = new DataStorage();
export default Data;




