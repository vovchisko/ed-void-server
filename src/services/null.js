const NULL = {
    tabs: {
        tabs: {
            'cmdr': {base: 'CMDR Profile', inject: ''},
            'navi': {base: 'Navigation', inject: ''},
            'vass': {base: 'VIOD Advanced Surface Scanner', inject: ''},
            'repo': {base: 'Reporting', inject: ''},
            'dev': {base: 'ED-VIOD/DEV', inject: ''}
        },
        c_tab: 'cmdr'
    },
    auth: {
        is_logged: false,
        email: '',
        pass: '',
        wtoken: ''
    },

    cmdr: {
        name: null,
        loc: {
            system: {name: null, starpos: [0, 0, 0], id: null},
            body: {name: null, r: null, g: null},
        },
        last_rec: null
    },

    user: {
        email: 'n/a',
        api_key: 'n/a'
    },

    navi: {
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
    },

    vass: {
        c_system: {
            name: null,
        },
        recent: []
    },
};

export default NULL;