<template>
    <div id="navi">

        <header>{{env.system? env.system.name : 'UNDEFINED SYSTEM'}}{{navi.body.name ? ' / ' + navi.body.name : '' }}</header>

        <div class="alert info" v-if="navi.pos.alt===null">
            <i class="i-ed-alert"></i>
            <div>Approach to the body<br/>NAV-Module will engage automatically</div>
            <small>Before approaching Scan body to identify radius and gravity correctly</small>
        </div>

        <div class="navi-surf" v-if="navi.pos.alt!==null">
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
                    <div class="col-6 cords justified">
                        <h5>CURR. POSITION</h5>
                        <em><b>LAT</b><span>{{navi.pos.lat | nn(4,4)}} <u>°</u></span></em>
                        <em><b>LON</b><span>{{navi.pos.lon | nn(4,4)}} <u>°</u></span></em>
                        <em><b>ALT</b><span>{{navi.pos.alt / 1000}} <u>KM</u></span></em>
                        <div v-if="navi.dest.enabled">
                            <br>
                            <em><b>HEAD</b><span>{{navi.dest.head | nn(0,0)}} <u>°</u></span></em>
                            <em><b>DIST</b><span>{{navi.dest.dist / 1000 | nn(3,3)}} <u>KM</u></span></em>
                        </div>
                    </div>
                    <div class="col-6 cords justified">
                        <h5>DESTINATION</h5>
                        <div v-if="navi.dest.enabled">
                            <em class="editable">
                                <b>LAT</b>
                                <span><input type="number" @focus="$event.target.select()" @change="recalc_dest()" v-model="navi.dest.lat"><u>°</u></span>
                            </em>
                            <em class="editable">
                                <b>LON</b>
                                <span><input type="number" @focus="$event.target.select()" @change="recalc_dest()" v-model="navi.dest.lon"><u>°</u></span>
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

        <div class="container-fluid location-data">
            <div class="centered">
                <div class="alert warn" v-if="navi.body.name !== null && !navi.body.radius">
                    <i class="i-ed-alert"></i>
                    <div>No scan data in database</div>
                    <small>Scan body to identify radius and gravity correctly</small>
                </div>

                <h4>{{env.system ? env.system.name : 'UNDEFINED SYSTEM'}}</h4>
                <div class="starpos" v-if="env.system"><u v-for="x in env.system.starpos">{{x/32}}; </u></div>

                <em><b>BODY</b> <span>{{navi.body.name || 'N/A'}}</span></em>
                <em><b>RADIUS</b> <span>{{navi.body.radius / 1000 || null | nn(3,3, 'N/A') }} <u>KM</u></span></em>
                <em><b>GRAVITY</b> <span>{{navi.body.gravity | nn(3,3, 'N/A')}} <u>G</u></span></em>

            </div>
        </div>
        <!-- <pre>{{env.body}}</pre> -->
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

    Net.on('uni:status', (stat) => update_dest(stat));

    Net.on('uni:c_body', (body) => {
        _navi.body.name = (body) ? (body.name.replace(Data.env.system.name, '')) : null;
        _navi.body.radius = (body && body.radius) ? body.radius : 0;
        _navi.body.gravity = (body) ? body.surf_gravity : null;
    });


    function update_dest(stat) {

        _navi.pos.alt = stat.alt;
        _navi.pos.head = stat.head;
        _navi.pos.lat = stat.lat;
        _navi.pos.lon = stat.lon;

        if (_navi.pos.alt === null) return;
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

    #navi {
        .justified em { }
        .justified em > b {  width: 30%}
        .justified em > span { width: 70% }
        .compass {overflow: hidden; height: 145px;margin: 0 -5px 10px -5px;
            .ruler { background: transparent url('../../public/assets/nav-ruler.gif') 0 0; width: 100%; height: 30px;margin: 40px 0 33px 0;position: relative;transition: all linear 1000ms;}
            .ruler .head {width: 50px;font-size: 14px;display: block;text-align: center;border: 1px solid #ff8800;color: #ff8800;position: absolute;left: 50%;margin: -30px 0 0 -25px;}
            .ruler .head:after { content: "";width: 0;height: 0;border-left: 5px solid transparent;border-right: 5px solid transparent;border-top: 5px solid #ff8800;display: block;position: absolute;left: 50%;margin: 5px 0 0 -5px;}
            .dest {
                background: transparent url('../../public/assets/nav-ruler-dest.gif') 0 0; width: 100%;height: 7px;position: relative;transition: all linear 1000ms;

                .head {width: 60px;font-size: 15px;display: block;text-align: center;border: 1px solid #555;color: #555;position: absolute;left: 50%;margin: 10px 0 0 -30px;}
                .head:after {content: "";width: 0;height: 0;border-left: 5px solid transparent;border-right: 5px solid transparent;border-bottom: 5px solid #555;display: block;position: absolute;left: 50%;margin: 5px 0 0 -5px;top: -14px;}
                .head:before {content: "vector";color: #676767;display: block;position: absolute;left: 50%;margin: 5px 0 0 -100px;top: -42px;width: 200px;text-align: center;text-transform: uppercase;font-size: 13px;}
                .head.alg0 {border-color: #0098f9;color: #0098f9;}
                .head.alg0:after {border-bottom-color: #0098f9;top: -14px;}
                .head.alg0:before {content: '[ ok ]'; color: #0098f9; }
                .head.alg1 {border-color: #FF8800;color: #FF8800;}
                .head.alg1:after {border-bottom-color: #FF8800;top: -14px;}
                .head.alg1:before {content: 'missaligment'; color: #FF8800; }
                .head.alg2 {border-color: red;color: red;}
                .head.alg2:after {border-bottom-color: red;top: -14px;}
                .head.alg2:before {content: 'wrong course vector!'; color: red; }

            }

        }
        .cords {
            input[type=number] { width: calc(100% - 1rem);text-align: right; margin-top: -0.2rem; height: 1.5rem; line-height: 1.5rem; font-size: 1rem; margin-bottom: 0.3rem}
            button { margin-top: 15px}
        }
        .location-data {
            margin-top: 3rem;
            h4 { margin-bottom: 0; }
            .starpos { text-align: center; margin-bottom: 0.5rem }
            .starpos u { font-size: 0.8rem; color: darken($ui-text, 25%); text-decoration: none;}
        }
        small { color: darken($ui-text, 25%);}
        .alert.info { margin-top: 2rem}
    }
</style>

