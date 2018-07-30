class DataStorage {

    constructor() {

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

    }

}

const Data = new DataStorage();
export default Data;





