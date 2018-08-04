import NET from '../ctrl/net';

class FlightLog {
    constructor() {
        this.recent = [];

    }

    push_rec(rec) {
        let recent = this.recent;
        for (let i = 0; i < recent.length; i++) {
            if (rec._id === recent[i]._id) {
                return;
            }
        }

        recent.push(rec);
        recent.sort((a, b) => {
            //new on top
            if (a.timestamp > b.timestamp) { return -1; }
            if (a.timestamp < b.timestamp) { return 1; }
            return 0;
        });

        // cut
        if (recent.length > 64)
            recent.splice(-1, 1);
    }
}

const FLOG = new FlightLog();

NET.on('pipe:Scan', (rec) => FLOG.push_rec(rec));
NET.on('pipe:FSDJump', (rec) => FLOG.push_rec(rec));

export default FLOG;





