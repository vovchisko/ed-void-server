//import Net from './network';
//Net.on('net:any', (c, rec) => { console.log(c, rec)});
import extend from 'deep-extend';
import Net from './network';
import Null from './null';
import Vue from 'vue';

class DataStorage {
    constructor() {
        this.tabs = {};
        this.auth = {};
        this.cmdr = {};
        this.user = {};
        this.navi = {};
        this.vass = {};
        this.env = {};

        this.init();
    }

    nullify() {
        for (let i in this) extend(this[i], Null[i]);
    }

    init() {

        this.nullify();

        //read wtoken
        let wtoken = localStorage.getItem('wtoken');
        if (wtoken) this.auth.wtoken = wtoken;

        //read wtoken
        let c_tab = localStorage.getItem('c_tab');
        if (c_tab) this.tabs.c_tab = c_tab;
    }

    save() {
        //save some data to locastorage
        localStorage.setItem('wtoken', this.auth.wtoken);
        localStorage.setItem('c_tab', this.tabs.c_tab);
    }
}

const Data = new DataStorage();
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


