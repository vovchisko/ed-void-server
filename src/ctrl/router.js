import EventEmitter3 from 'eventemitter3';

class TinyRouter extends EventEmitter3 {

    constructor() {
        super();
        this.action = null;
        this.params = [];
        this._bind_change()
        this.track_route();
    }

    _bind_change() {
        window.onhashchange = () => {
            this.track_route();
        };
    }

    track_route() {
        this.params.splice(0, this.params.length);
        if (window.location.hash) {
            let hash_parts = window.location.hash.substring(1).split('/');
            if (hash_parts.length > 0) this.action = hash_parts[0];
            if (hash_parts.length > 1) {
                for (let i = 1; i < hash_parts.length; i++) {
                    this.params.push(hash_parts[i]);
                }
            }
        }
        this.emit('route', this.action, this.params);
    }

    /**
     * Reload page with no hash
     */
    reset_route(){
        window.location = window.location.href.split('#')[0];
    }
}

const Route = new TinyRouter();

export default Route;

