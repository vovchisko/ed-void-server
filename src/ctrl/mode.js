import CFG from './cfg'

let MODE = {
    list: {
        'cmdr': 'cmdr',
        'navi': 'nav',
        'vass': 'scan',
        'repo': 'poi',
        'run': 'run',
        'cfg': 'cfg',
    },
    is_in: false,
    is_ready: false,
    c_mode: 'cmdr',
    go: function (mode = null) {
        if (mode) {
            this.c_mode = mode;
        } else {
            this.c_mode = 'cfg';
        }
        CFG.c_mode = this.c_mode;
        CFG.save();
    },
    check: function () {

    },
};

MODE.c_mode = CFG.c_mode;

export default MODE;
