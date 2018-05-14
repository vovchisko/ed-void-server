//import Net from './network';
//Net.on('net:any', (c, rec) => { console.log(c, rec)});
import extend from 'deep-extend';
import Net from './network';
import Vue from 'vue';

class DataStorage {
    constructor() {
        this._null = {};

        this.modes = {
            modes: ['cmdr', 'navi', 'vass', 'repo', 'dev'],
            c_mode: 'cmdr'
        };

        this.poi = {
            current: {
                _id: null,
                type: null,
                subject: '',
                description: '',
                links: [],
                system_name: '',
                system_id: null,
                body_name: '',
                body_id: null,
                starpos: [0, 0, 0],
                lat: 0,
                lon: 0,
            },
            recents: [],
            search: {
                request: {
                    type: null,
                    text: {}
                },
                results: []
            }
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
            last_rec: null
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

    nullify() {
        for (let i in this) {
            extend(this[i], this._null[i]);
        }
    }

    init() {

        for (let i in this) {
            if (i[0] !== '_') {
                this._null[i] = {};
                extend(this._null[i], this[i])
            }
        }

        console.log(this);


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

const
    Data = new DataStorage();
export default Data;


Net.on('cmdr', (cmdr) => {
    if (!cmdr) return false;
    extend(Data.cmdr, cmdr);
});

Net.on('user', (user) => {
    Data.user.email = user.email;
    Data.user.api_key = user.api_key;
});

Net.on('uni:c_system', (system) => Vue.set(Data.env, 'system', system));
Net.on('uni:c_body', (body) => Vue.set(Data.env, 'body', body));

