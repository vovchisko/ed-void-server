<template>
    <div id="navi">

        <header>{{env.system? env.system.name : 'NAVIGATION MODULE'}}</header>

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
                        <em><b>LAT</b><span>{{navi.pos.lat | nn(4,4)}} <u>°</u></span></em>
                        <em><b>LON</b><span>{{navi.pos.lon | nn(4,4)}} <u>°</u></span></em>
                        <em><b>ALT</b><span>{{navi.pos.alt / 1000}} <u>KM</u></span></em>
                    </div>
                    <div class="col-6 cords">
                        <h5>DESTINATION</h5>

                        <div v-if="navi.dest.enabled">
                            <em><b>HEAD</b><span>{{navi.dest.head | nn(0,0,'err')}} <u>°</u></span></em>
                            <em><b>DIST</b><span>{{navi.dest.dist / 1000 | nn(3,3,'err')}} <u>KM</u></span></em>
                            <em class="editable">
                                <b>LAT</b>
                                <span><input type="number"
                                             @focus="$event.target.select()"
                                             @change="recalc_dest()"
                                             v-model="navi.dest.lat"><u>°</u></span>
                            </em>
                            <em class="editable">
                                <b>LON</b>
                                <span><input type="number"
                                             @focus="$event.target.select()"
                                             @change="recalc_dest()"
                                             v-model="navi.dest.lon"><u>°</u></span>
                            </em>
                        </div>

                        <button v-bind:class="navi.dest.enabled?'active':''"
                                v-on:click="navi.dest.enabled = !navi.dest.enabled; recalc_dest()">
                            {{ !navi.dest.enabled ? 'SET COURSE' : 'DISMISS' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="container-fluid">
            <div>
                <em><b>SYSTEM</b> <span>{{env.system? env.system.name : 'N/A'}}</span></em>
                <em><b>BODY</b> <span>{{navi.body.name || 'N/A'}}</span></em>
                <em><b>RADIUS</b> <span>{{navi.body.radius / 1000 | nn(3,3, 'NO DATA')}} <u>KM</u></span></em>
                <em><b>GRAVITY</b> <span>{{navi.body.surf_gravity | nn(3,3, '#')}} <u>G</u></span></em>
                <div class="alert warn" v-if="navi.pos.alt && !navi.body.radius">
                    <i class="i-ed-alert"></i>
                    <div>No scan data in database</div>
                    <small>Scan body to identify radius and gravity correctly</small>
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
            return {navi: Data.navi, env: Data.env}
        },
        methods: {recalc_dest: () => recalc_dest()}
    }

    const _navi = Data.navi;

    Net.on('pipe:Status', (stat) => update_dest(stat));
    Net.on('uni:c_body', (body) => {
        console.log(body)
        _navi.body.name = (body) ? body.name : null;
        _navi.body.radius = (body && body.radius) ? body.radius : 0;
        _navi.body.surf_gravity = (body) ? body.surf_gravity : null;
    });


    function update_dest(stat) {

        _navi.pos.alt = stat.Altitude;
        _navi.pos.head = stat.Heading;
        _navi.pos.lat = stat.Latitude;
        _navi.pos.lon = stat.Longitude;

        if (!_navi.pos.alt) return;
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
            _navi.dest.dist = Math.acos(Math.sin(latStart) * Math.sin(latDest) + Math.cos(latStart) * Math.cos(latDest) * Math.cos(deltaLon)) * (_navi.body.radius);
            _navi.dest.head = Math.floor(initialBearing);
            isNaN(_navi.dest.head) ? _navi.dest.head = 'ERR' : null;
        }

        let rw = window.innerWidth;
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
    @import "../styles/vars";

    // NAV MODULE

    #navi {}
    #navi .compass {overflow: hidden; background: #111;height: 145px;margin: 0 -5px 10px -5px;}
    #navi .compass .ruler { background: transparent url('../../public/assets/nav-ruler.gif') 0 0; width: 100%; height: 30px;margin: 40px 0 33px 0;position: relative;transition: all linear 1000ms;}
    #navi .compass .ruler .head {width: 50px;font-size: 14px;display: block;text-align: center;border: 1px solid #ff8800;color: #ff8800;position: absolute;left: 50%;margin: -30px 0 0 -25px;}
    #navi .compass .ruler .head:after { content: "";width: 0;height: 0;border-left: 5px solid transparent;border-right: 5px solid transparent;border-top: 5px solid #ff8800;display: block;position: absolute;left: 50%;margin: 5px 0 0 -5px;}
    #navi .compass .dest { background: transparent url('../../public/assets/nav-ruler-dest.gif') 0 0; width: 100%;height: 7px;position: relative;transition: all linear 1000ms;}
    #navi .compass .dest .head {width: 60px;font-size: 15px;display: block;text-align: center;border: 1px solid #555;color: #555;position: absolute;left: 50%;margin: 10px 0 0 -30px;}
    #navi .compass .dest .head:after {content: "";width: 0;height: 0;border-left: 5px solid transparent;border-right: 5px solid transparent;border-bottom: 5px solid #555;display: block;position: absolute;left: 50%;margin: 5px 0 0 -5px;top: -14px;}
    #navi .compass .dest .head:before {content: "vector";color: #676767;display: block;position: absolute;left: 50%;margin: 5px 0 0 -100px;top: -42px;width: 200px;text-align: center;text-transform: uppercase;font-size: 13px;}
    #navi .compass .dest .head.alg0 {border-color: #0098f9;color: #0098f9;}
    #navi .compass .dest .head.alg0:after {border-bottom-color: #0098f9;top: -14px;}
    #navi .compass .dest .head.alg0:before {content: '[ ok ]'; color: #0098f9; }
    #navi .compass .dest .head.alg1 {border-color: #FF8800;color: #FF8800;}
    #navi .compass .dest .head.alg1:after {border-bottom-color: #FF8800;top: -14px;}
    #navi .compass .dest .head.alg1:before {content: 'missaligment'; color: #FF8800; }
    #navi .compass .dest .head.alg2 {border-color: red;color: red;}
    #navi .compass .dest .head.alg2:after {border-bottom-color: red;top: -14px;}
    #navi .compass .dest .head.alg2:before {content: 'wrong course vector!'; color: red; }
    #navi .cords input[type=number] {border: 0 none;width: calc(100% - 20px);text-align: right;line-height: inherit;height: auto;padding: 0;}
    #navi .cords button { margin-top: 15px}

</style>

