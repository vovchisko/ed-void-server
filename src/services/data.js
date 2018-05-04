//import Net from './network';
//Net.on('net:any', (c, rec) => { console.log(c, rec)});


const EMPTY_CMDR = {
    "name": null,
    "loc": {
        "system": {
            "name": null,
            "coord": [0, 0, 0]
        },
        "body": {
            "name": null,
            "r": null,
            "g": null,
        }
    },
    "last_rec": null
};


class DataStorage {
    constructor() {
        this.tabs = {
            tabs: {
                'cmdr': {base: 'CMDR Profile', inject: ''},
                'navi': {base: 'Navigation', inject: ''},
                'vass': {base: 'VIOD Advanced Surface Scanner', inject: ''},
                'repo': {base: 'Reporting', inject: ''},
                'dev': {base: 'ED-VIOD/DEV', inject: ''}
            },
            c_tab: localStorage.getItem('c_tab') || 'cmdr'
        };
        this.auth = {
            is_logged: false,
            email: '',
            pass: '',
            wtoken: ''
        };
        this.cmdr = {
            name: null,
            loc: {
                system: {name: null},
                body: {name: null},
            }
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
        };
        this.vass = {
            c_system: {
                name: null,
            },
            recent: []
        };
    }

    upd_cmdr(cmdr) {
        // extend cmdr data with passed
    }

    upd_user(cmdr) {
        // extend user data with passed
    }


}


const Data = new DataStorage();
export default Data;
