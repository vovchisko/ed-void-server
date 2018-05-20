//import Net from './network';
//Net.on('net:any', (c, rec) => { console.log(c, rec)});
import extend from 'deep-extend';
import Net from './network';
import Vue from 'vue';

class DataStorage {
    constructor() {
        this._null = {};

        this.app = {
            overload: false
        };

        this.modes = {
            modes: ['cmdr', 'navi', 'vass', 'repo', 'dev'],
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
            recent: [],

        };

        this.auth = {
            is_logged: false,
            email: '',
            pass: '',
            wtoken: ''
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
            api_key: 'n/a'
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
            body: {name: null, radius: 0, gravity: 0}
        };

        this.vass = {
            recent: []
        };

        this.env = {
            system: null,
            body: null,
            station: null,
        };

        this.init();
    }

    nullify(only = null) {
        if (only !== null) {
            extend(this[only], this._null[only]);
        } else {
            for (let i in this) extend(this[i], this._null[i]);
        }

    }

    init() {

        for (let i in this) {
            if (i[0] !== '_') {
                this._null[i] = {};
                extend(this._null[i], this[i])
            }
        }

        //read wtoken
        let wtoken = localStorage.getItem('wtoken');
        if (wtoken) this.auth.wtoken = wtoken;

        //read wtoken
        let c_mode = localStorage.getItem('c_mode');
        if (c_mode) this.modes.c_mode = c_mode;
    }

    save() {
        //save some data to locastorage
        localStorage.setItem('wtoken', this.auth.wtoken);
        localStorage.setItem('c_mode', this.modes.c_mode);
    }
}

const Data = new DataStorage();
export default Data;





