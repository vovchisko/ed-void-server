
class DataStorage {
    constructor() {

        this.cmdr = {
            name: null,
            sys_id: null,
            body_id: null,
            starpos: [0, 0, 0],
            last_rec: null,
            status: {}
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





