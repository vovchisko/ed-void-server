//import Net from './network';

import extend from 'deep-extend';
import Net from './network';
import Vue from 'vue';

class DataStorage {
    constructor() {
        this._null = {};

        this.app = {
            overload: false,
        };

        this.cfg = {
            ui_font_size: '100%',
            ui_fx_level: 'full',
            _font_size_vars: new Array(17).fill(0).map((x, i) => {return i * 10 + 40 + '%'}),
            _fx_level_vars: ['full', 'medium', 'low', 'disabled']
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
            api_key: ''
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
                lat: 0, lon: 0, azi: 0, dist: 0,
                align: ''
            },
            body: {name: null, radius: 0, gravity: 0, c_radius_km: 0}
        };

        this.vass = {
            recent: [],
            data: {
                total: 0,
                summ: {
                    L: {count: 0, total: 0},
                    P: {count: 0, total: 0},
                    S: {count: 0, total: 0},
                },
                systems: {}
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

        this.auth.api_key = (localStorage.getItem('api_key')) || this.auth.api_key;
        this.modes.c_mode = (localStorage.getItem('c_mode')) || this.modes.c_mode;
        this.cfg.ui_font_size = (localStorage.getItem('ui_font_size')) || this.cfg.ui_font_size;
        this.cfg.ui_fx_level = (localStorage.getItem('ui_fx_level')) || this.cfg.ui_fx_level;

        this.apply_ui_cfg();
    }

    save() {
        //save some data to locastorage
        localStorage.setItem('api_key', this.auth.api_key);
        localStorage.setItem('c_mode', this.modes.c_mode);
        localStorage.setItem('ui_font_size', this.cfg.ui_font_size);
        localStorage.setItem('ui_fx_level', this.cfg.ui_fx_level);
    }

    nullify(section) {
        if (section === 'repo.curr') extend(this.repo.curr, this._null.repo.curr);
    }

    apply_ui_cfg() {
        document.body.style.fontSize = this.cfg.ui_font_size;
        document.body.className = 'edfx-lv-' + this.cfg.ui_fx_level;
    }
}

const Data = new DataStorage();
export default Data;





