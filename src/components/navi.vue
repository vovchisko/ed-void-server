<template>
    <div id="navi">
        <div class="navi-surf" v-if="navi.pos.alt">
            <div class="compass">
                <div class="ruler" v-bind:style="navi.style_ruler">
                    <b class="head">{{navi.pos.head}}</b>
                </div>
                <div class="dest" v-bind:style="navi.style_dest" v-if="navi.dest.enabled">
                    <b class="head" v-bind:class="navi.dest.align">{{navi.dest.head}}</b>
                </div>
            </div>
            <div class="container-fluid">
                <div class="row">
                    <div class="col-6 cords">
                        <h5>CURR. POSITION</h5>
                        <em><b>LAT</b><span>{{navi.pos.lat | nn(4,4)}} <i>°</i></span></em>
                        <em><b>LON</b><span>{{navi.pos.lon | nn(4,4)}} <i>°</i></span></em>
                        <em><b>ALT</b><span>{{navi.pos.alt / 1000}} <i>KM</i></span></em>
                    </div>
                    <div class="col-6 cords">
                        <h5>DESTINATION</h5>

                        <div v-if="navi.dest.enabled">
                            <em><b>HEAD</b><span>{{navi.dest.head | nn(0,0,'err')}} <i>°</i></span></em>
                            <em><b>DIST</b><span>{{navi.dest.dist / 1000 | nn(3,3,'err')}} <i>KM</i></span></em>
                            <em class="editable">
                                <b>LAT</b>
                                <span><input type="number"
                                             @focus="$event.target.select()"
                                             @change="recalc_dest()"
                                             v-model="navi.dest.lat"><i>°</i></span>
                            </em>
                            <em class="editable">
                                <b>LON</b>
                                <span><input type="number"
                                             @focus="$event.target.select()"
                                             @change="recalc_dest()"
                                             v-model="navi.dest.lon"><i>°</i></span>
                            </em>

                        </div>

                        <button v-bind:class="navi.dest.enabled?'active':''"
                                v-on:click="navi.dest.enabled = !navi.dest.enabled">
                            {{ !navi.dest.enabled ? 'SET COURSE' : 'DISMISS' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="container-fluid">
            <h5>CURRENT LOCATION</h5>
            <div v-if="!navi.pos.alt">
                <em><b>SYS</b><span>{{cmdr.loc.system.name}}</span></em>
                <em><b></b><span>Seep Space</span></em>
                <div class="notification huge">
                    <div>NAV-mode will turns on automatically on approach.</div>
                </div>
            </div>
            <div v-if="navi.pos.alt">
                <em><b>BODY</b><span
                        v-bind:class="cmdr.loc.body.name?'':'false'">{{cmdr.loc.body.name || 'FALSE'}}</span></em>
                <em>
                    <b>RADIUS</b>
                    <span v-bind:class="cmdr.loc.body.name?'':'false'">{{cmdr.loc.body.r / 1000 | nn(3,3)}} <i>KM</i></span>
                </em>
                <em>
                    <b>GRAVITY</b>
                    <span v-bind:class="cmdr.loc.body.name?'':'false'">{{cmdr.loc.body.g / 9.80665 | nn(4)}} <i>G</i></span>
                </em>
                <div class="notification warn" v-if="navi.pos.alt && !cmdr.loc.body.r">
                    <div>Scan body to identify radius and gravity correctly</div>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
    import Data from '../services/data'
    import Net from '../services/network'

    export default {
        name: "navi",
        data: () => {
            return {
                cmdr: Data.cmdr,
                navi: Data.navi
            }
        },
        methods: {
            recalc_dest: () => {
                console.log('hey!');
                recalc_dest();
            }
        }
    }

    const _cmdr = Data.cmdr;
    const _navi = Data.navi;

    Net.on('rec:Status', (stat) => update_dest(stat));

    function update_dest(stat) {

        if (!_cmdr.loc.body.r) return;

        _navi.pos.alt = stat.Altitude;
        _navi.pos.head = stat.Heading;
        _navi.pos.lat = stat.Latitude;
        _navi.pos.lon = stat.Longitude;

        recalc_dest();
    }

    function recalc_dest() {
        if (_navi.dest.enabled) {
            let latStart = _navi.pos.lat * Math.PI / 180;
            let lonStart = _navi.pos.lon * Math.PI / 180;
            let latDest = _navi.dest.lat * Math.PI / 180;
            let lonDest = _navi.dest.lon * Math.PI / 180;
            let deltaLon = lonDest - lonStart;
            let deltaLat = Math.log(Math.tan(Math.PI / 4 + latDest / 2) / Math.tan(Math.PI / 4 + latStart / 2));
            let initialBearing = (Math.atan2(deltaLon, deltaLat)) * (180 / Math.PI);
            if (initialBearing < 0) initialBearing = 360 + initialBearing;
            _navi.dest.dist = Math.acos(Math.sin(latStart) * Math.sin(latDest) + Math.cos(latStart) * Math.cos(latDest) * Math.cos(deltaLon)) * _cmdr.loc.body.r;
            _navi.dest.head = Math.floor(initialBearing);
            isNaN(_navi.dest.head) ? _navi.dest.head = 'ERR' : null;
        }

        let rw = window.innerWidth; //$refs.ruler.clientWidth;
        let offset = (rw / 2) - _navi.pos.head * 4;
        _navi.style_ruler['background-position-x'] = offset + 'px';

        if (_navi.dest.enabled) {

            let odest = (rw / 2) - (_navi.pos.head - _navi.dest.head) * 4;
            _navi.style_dest['background-position-x'] = odest + 'px';

            let alg = Math.abs(_navi.dest.head - _navi.pos.head);

            if (alg <= 3) _navi.dest.align = 'alg0';
            if (alg > 3) _navi.dest.align = 'alg1';
            if (alg > 10) _navi.dest.align = 'alg2';
        }
    }


</script>

<style lang="scss">

</style>

