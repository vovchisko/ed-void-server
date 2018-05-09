//import Net from './network';
//Net.on('net:any', (c, rec) => { console.log(c, rec)});
import extend from 'deep-extend'
import NULL from './null';

class DataStorage {
    constructor() {
        this.tabs = {};
        this.auth = {};
        this.cmdr = {};
        this.user = {};
        this.navi = {};
        this.vass = {};

        this.init();
    }

    nullify() {
        for (let i in this) extend(this[i], NULL[i]);
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
