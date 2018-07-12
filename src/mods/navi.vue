<template>
    <div id="navi">

        <header>{{env.system? env.system.name : 'UNDEFINED SYSTEM'}}{{env.body ? ' / ' + env.body.short_name : '' }}{{env.station ? ' / ' +  env.station.name : '' }}</header>

        <div class="alert info edfx" v-if="N.status.head === null">
            <i class="i-ed-alert"></i>
            <h4>Approach to the body
                <div class="objective">{{N.dest.body_id}}</div>
            </h4>
            <p>nav-module will engage automatically on approach</p>
        </div>

        <div class="navi-surf" v-if="N.status.head !== null">
            <div class="compass edfx">
                <div class="ruler" v-bind:style="N.style_ruler">
                    <b class="head">{{N.status.head}}</b>
                </div>
                <div class="dest" v-if="N.dest.head" v-bind:style="N.style_dest">
                    <b class="head" v-bind:class="N.dest_align">{{N.dest.head}}</b>
                </div>
            </div>
        </div>

        <div class="container-fluid">

            <div class="row">
                <div class="col-sm edfx">
                    <h5>CURR. POSITION</h5>
                    <em v-if="env.system"><b>SYSTEM</b><span>{{env.system.name}}</span></em>
                    <em v-if="env.body"><b>BODY</b><span>{{env.body.name}}</span></em>
                    <em v-if="env.station"><b>ST</b><span>{{env.station.name}}</span></em>
                    <em v-if="!env.station && !env.body"><b>&nbsp;</b><span>deep space</span></em>
                    <em v-if="N.status.alt"><b>LAT</b><span>{{N.status.lat}} <u>°</u></span></em>
                    <em v-if="N.status.alt"><b>LON</b><span>{{N.status.lon}} <u>°</u></span></em>
                    <em v-if="N.status.alt"><b>ALT</b><span>{{N.status.alt}} <u>M</u></span></em>
                </div>
                <div class="col-sm">
                    <div class="ui" v-if="N.edit" >
                        <button @click="set_goal(g)" v-for="g in N.DEST_GOAL" v-bind:class="N.dest.goal === g ? 'active':''">{{g}}</button>
                    </div>
                    <div v-if="!N.edit">
                        <h5>DESTINATION</h5>
                        <em v-if="N.dest.sys_id"><b>SYS</b><span>{{N.dest.sys_id}}</span></em>
                        <em v-if="N.dest.st_id"><b>ST</b><span>{{N.dest.st_id}}</span></em>
                        <em v-if="N.dest.body_id"><b>BODY</b><span>{{N.dest.body_id}}</span></em>
                        <em v-if="N.dest.head"><b>HEAD</b><span>{{N.dest.head | nn(0,0)}} <u>°</u></span></em>
                        <em v-if="N.dest.dist"><b>DIST</b><span>{{N.dest.dist | nn(3,3)}} <u>KM</u></span></em>
                    </div>

                    <div v-if="N.edit">
                        <div v-if="N.dest.goal === N.DEST_GOAL.STATION">
                            <input-station :id.sync="N.dest.st_id" label="target station"></input-station>
                        </div>

                        <div v-if="N.dest.goal ===  N.DEST_GOAL.SYSTEM">
                            <input-system :id.sync="N.dest.sys_id" label="target system"></input-system>
                        </div>

                        <div v-if="N.dest.goal ===  N.DEST_GOAL.BODY">
                            <input-body :id.sync="N.dest.body_id" label="target body (approach)"></input-body>
                        </div>

                        <div v-if="N.dest.goal === N.DEST_GOAL.SURFACE">
                            <input-body :id.sync="N.dest.body_id" label="target body"></input-body>
                            <div class="ui">
                                <input type="number" min="-90" max="90" step="any" @focus="$event.target.select()" v-model="N.dest.lat">
                                <label>lat</label>
                            </div>
                            <div class="ui">
                                <input type="number" min="-180" max="180" step="any" @focus="$event.target.select()" v-model="N.dest.lon">
                                <label>lon</label>
                            </div>
                            <div class="ui" v-if="N.dest.f.includes('-CR')">
                                <input type="number" @focus="$event.target.select()" v-model="N.dest.r">
                                <label>target body radius</label>
                            </div>
                        </div>

                    </div>

                    <div class="ui">
                        <button v-if="!N.edit" v-on:click="dest_edit()"><i class="i-aim"></i> edit destination</button>
                        <button v-if="N.edit" v-on:click="dest_apply()"><i class="i-aim"></i> apply destination</button>&nbsp;
                        <button v-on:click="dest_clear()"><i class="i-cross"></i> clear</button>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-6 cords justified">
                    <pre>{{N.status}}</pre>
                </div>
                <div class="col-6 cords justified">
                    <pre>{{N.dest}}</pre>
                </div>
            </div>

            <!--pre>
                Can we do SupercruiseExit or ApproachBody on non-landable planets?
            </pre-->
        </div>
    </div>
</template>

<script>
    import NET from '../ctrl/network'
    import PILOT from '../ctrl/pilot'
    import InputBody from "../components/input-body";
    import InputStation from "../components/input-station";
    import InputSystem from "../components/input-system";
    import extend from 'deep-extend';
    import {A} from '../components/alert';

    const N = {
        style_ruler: {'background-position-x': 0},
        style_dest: {'background-position-x': 0},
        status: PILOT.status,
        dest: PILOT.dest,
        dest_align: '',
        edit: false,

        DEST_GOAL: {
            SURFACE: 'surface',
            BODY: 'body',
            SYSTEM: 'system',
            STATION: 'station',
        },
    };

    export default {
        name: "navi",
        components: {InputSystem, InputStation, InputBody},
        data: () => {
            return {
                N: N,
                env: PILOT.env,
            }
        },
        methods: {
            set_goal: function (g) {
                N.dest.goal = g;
            },
            dest_clear: function () {
                NET.send('dest-set', null);
                N.edit = false;
            },
            dest_edit: function () {
                NET.send('dest-toggle', false);
                if (!N.dest.goal) N.dest.goal = N.DEST_GOAL.SURFACE;
                N.edit = true;
            },
            dest_apply: function () {
                NET.send('dest-set', N.dest);
                N.edit = false;
            },
        }
    }


    NET.on('uni:status', (dest) => update_head(dest));
    NET.on('uni:dest', (dest) => update_head(dest));
    NET.on('uni:dest-set', (dest) => {
        if (dest.f.includes('/ER')) { N.edit = true; }
    });

    function update_head(dest) {
        let rw = window.innerWidth;
        let offset = (rw / 2) - N.status.head * 4;
        N.style_ruler['background-position-x'] = offset + 'px';
        if (N.dest.enabled) {
            if (isNaN(N.dest.head)) {
                N.style_dest['background-position-x'] = '0px';
                N.dest_align = 'err';
            } else {
                N.style_dest['background-position-x'] = (rw / 2) - ((N.status.head - N.dest.head) * 4) + 'px';
                let alg = Math.abs(N.dest.head - N.status.head);
                if (alg <= 3) N.dest_align = 'alg0';
                if (alg > 3) N.dest_align = 'alg1';
                if (alg > 10) N.dest_align = 'alg2';
            }
        }
    }

</script>

<style lang="scss">
    @import "../styles/vars";

    // NAV MODULE

    #navi {
        header { }
        em { }
        em > b { width: 30%}
        em > span { width: 70%; text-align: left }
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

        .location-data {
            margin-top: 3em;
            h4 { margin-bottom: 0; }
        }
        small { color: darken($ui-text, 25%);}
        .alert.info { margin-top: 2em}
    }
</style>

