<template>
    <div id="navi">

        <header class="edfx">{{env.system? env.system.name : 'UNDEFINED SYSTEM'}}{{env.body ? ' / ' + env.body.short_name : '' }}</header>

        <div class="alert info edfx" v-if="navi.status.alt===null">
            <i class="i-ed-alert"></i>
            <div>Approach to the body<br/>NAV-Module will engage automatically</div>
            <small>Scan body Before approaching to identify radius and gravity correctly</small>
        </div>

        <div class="navi-surf" v-if="navi.status.alt!==null">
            <div class="compass edfx">
                <div class="ruler" v-bind:style="navi.style_ruler">
                    <b class="head">{{navi.status.head}}</b>
                </div>
                <div class="dest" v-bind:style="navi.style_dest" v-if="dest_on">
                    <b class="head" v-bind:class="navi.dest_align">{{navi.dest.head}}</b>
                </div>
            </div>
            <div class="container-fluid">
                <div class="row">
                    <div class="col-6 cords justified">
                        <div class="edfx">
                            <h5>CURR. POSITION</h5>
                            <em><b>LAT</b><span>{{navi.status.lat | nn(4,4)}} <u>°</u></span></em>
                            <em><b>LON</b><span>{{navi.status.lon | nn(4,4)}} <u>°</u></span></em>
                            <em><b>ALT</b><span>{{navi.status.alt / 1000}} <u>KM</u></span></em>
                        </div>
                        <div v-if="dest_on" class="edfx">
                            <br>
                            <em><b>HEAD</b><span>{{navi.dest.head | nn(0,0)}} <u>°</u></span></em>
                            <em><b>DIST</b><span>{{navi.dest.dist / 1000 | nn(3,3)}} <u>KM</u></span></em>
                        </div>
                    </div>
                    <div class="col-6 cords justified">
                        <h5>DESTINATION</h5>
                        <div v-if="dest_on" class="edfx">
                            <em class="editable">
                                <b>LAT</b>
                                <span><input type="number" min="-90" max="90" step="any" @focus="$event.target.select()" v-model="navi.dest.lat"><u>°</u></span>
                            </em>
                            <em class="editable">
                                <b>LON</b>
                                <span><input type="number" min="-180" max="180" step="any" @focus="$event.target.select()" v-model="navi.dest.lon"><u>°</u></span>
                            </em>
                            <em class="editable" v-if="env.body, !env.body.radius">
                                <b>RADIUS</b>
                                <span><input type="number" @focus="$event.target.select()" v-model="navi.c_radius_km"><u>KM</u></span>
                            </em>
                        </div>
                        <button class="edfx" v-if="!dest_on" v-on:click="dest_on = true"><i class="i-aim"></i> SET DESTINATION</button>
                        <button class="edfx" v-if="dest_on" v-on:click="dest_apply()"><i class="i-aim"></i> APPLY DESTINATION</button>
                        <button class="edfx" v-if="dest_on" v-on:click="dest_dismiss()"><i class="i-cross"></i> DISMISS</button>

                    </div>
                </div>
            </div>
            <pre>{{navi}}</pre>
            <div class="container-fluid location-data edfx">
                <div class="centered">
                    <div class="alert warn " v-if="!env.body || !env.body.radius">
                        <i class="i-ed-alert"></i>
                        <div>No scan data in database</div>
                        <small>Scan body to identify radius and gravity correctly</small>
                    </div>
                    <div>
                        <h4>{{env.system ? env.system.name : 'UNDEFINED SYSTEM'}}</h4>
                        <div class="starpos" v-if="env.system"><u v-for="x in env.system.starpos">{{x/32}}; </u></div>
                        <div v-if="env.body">
                            <em><b>BODY</b> <span>{{env.body.name || 'N/A'}}</span></em>
                            <em><b>RADIUS</b> <span>{{env.body.radius / 1000 || null | nn(3,3, 'N/A') }} <u>KM</u></span></em>
                            <em><b>GRAVITY</b> <span>{{env.body.gravity | nn(3,3, 'N/A')}} <u>G</u></span></em>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
    import NET from '../ctrl/network'
    import PILOT from '../ctrl/pilot'

    const _navi = {
        style_ruler: {'background-position-x': 0},
        style_dest: {'background-position-x': 0},
        status: PILOT.status,
        dest: PILOT.dest,
        c_radius_km: 1001,
        dest_align: '',
    };

    export default {
        name: "navi",
        data: () => {
            return {
                dest_on: false,
                navi: _navi,
                env: PILOT.env
            }
        },
        methods: {
            dest_apply: function () {
                NET.send('dest-apply', {
                    //todo: you can specify "r" manually
                    sys_id: null,
                    body_id: null,
                    station_id: null,
                    lat: this.navi.dest.lat,
                    lon: this.navi.dest.lon,
                    r: this.env.body.radius || _navi.c_radius_km,
                    goal: 0 // describe goal condition. reach by default.
                })
            },
            dest_dismiss: function () {
                NET.send('dest-dismiss');
                this.dest_on = false;
            },
        }
    }


    NET.on('uni:dest', (dest) => update_dest());

    function update_dest() {
        let rw = window.innerWidth;
        let offset = (rw / 2) - _navi.status.head * 4;
        _navi.style_ruler['background-position-x'] = offset + 'px';
        if (_navi.dest.enabled) {
            if (isNaN(_navi.dest.head)) {
                _navi.style_dest['background-position-x'] = '0px';
                _navi.dest_align = 'err';
            } else {
                _navi.style_dest['background-position-x'] = (rw / 2) - ((_navi.status.head - _navi.dest.head) * 4) + 'px';
                let alg = Math.abs(_navi.dest.head - _navi.status.head);
                if (alg <= 3) _navi.dest_align = 'alg0';
                if (alg > 3) _navi.dest_align = 'alg1';
                if (alg > 10) _navi.dest_align = 'alg2';
            }
        }
    }

</script>

<style lang="scss">
    @import "../styles/vars";

    // NAV MODULE

    #navi {
        header { }
        .justified em { }
        .justified em > b { width: 30%}
        .justified em > span { width: 70%; text-align: left }
        .compass {overflow: hidden; height: 145px;margin: 0 -5px 10px -5px;
            .ruler { image-rendering: pixelated;
                background: transparent url('../../public/assets/nav-ruler.gif') 0 0; width: 100%; height: 30px;margin: 40px 0 33px 0;position: relative;transition: all linear 1000ms;}
            .ruler .head {width: 50px;font-size: 14px;display: block;text-align: center;border: 1px solid #ff8800;color: #ff8800;position: absolute;left: 50%;margin: -30px 0 0 -25px;}
            .ruler .head:after { content: "";width: 0;height: 0;border-left: 5px solid transparent;border-right: 5px solid transparent;border-top: 5px solid #ff8800;display: block;position: absolute;left: 50%;margin: 5px 0 0 -5px;}
            .dest {
                image-rendering: pixelated;
                background: transparent url('../../public/assets/nav-ruler-dest.gif') 0 0; width: 100%;height: 7px;position: relative;transition: all linear 1000ms;

                .head {transition: transform linear 0.5s; width: 60px;font-size: 15px;display: block;text-align: center;border: 1px solid #555;color: #555;position: absolute;left: 50%;margin: 10px 0 0 -30px;}
                .head:after {content: "";width: 0;height: 0;border-left: 7px solid transparent;border-right: 7px solid transparent;border-bottom: 7px solid #555;display: block;position: absolute;left: 50%;margin: 3px 0 0 -6.5px;top: -14px;}
                .head:before {content: "vector";color: #676767;display: block;position: absolute;left: 50%;margin: 5px 0 0 -100px;top: -42px;width: 200px;text-align: center;text-transform: uppercase;font-size: 13px;}
                .head.alg0 {border-color: #0098f9;color: #0098f9;}
                .head.alg0:after {border-bottom-color: #0098f9;top: -14px;}
                .head.alg0:before {content: '[ ok ]'; color: #0098f9; }
                .head.alg1 {border-color: #FF8800;color: #FF8800;}
                .head.alg1:after {border-bottom-color: #FF8800;top: -14px;}
                .head.alg1:before {content: 'missaligment'; color: #FF8800; }
                .head.alg2 {border-color: $red;color: $red;}
                .head.alg2:after {border-bottom-color: $red; top: -14px;}
                .head.alg2:before {content: 'wrong course vector!'; color: $red; }
                .head.err { animation: glitched_text 2.5s infinite; color: $red; border-color: $red; }
                .head.err:after { border-bottom-color: $red; }
                .head.err:before { content: 'destination data invalid'; color: $red }
            }
        }
        .cords {
            .editable {
                line-height: 2.4em;
                b { }
                span { }
                span input { border-width: 0 0 1px 0 !important; }
                span u { }
            }
            input[type=number] { width: calc(100% - 2.1em); display: inline-block; text-align: right; line-height: 1.8em; font-size: 1.2em; max-width: 13em; }
            button { margin-top: 15px}
        }
        .location-data {
            margin-top: 3em;
            h4 { margin-bottom: 0; }
        }
        small { color: darken($ui-text, 25%);}
        .alert.info { margin-top: 2em}
    }
</style>

