<template>
    <div id="navi">

        <header>{{env.system? env.system.name : 'UNDEFINED SYSTEM'}}{{env.body ? ' / ' + env.body.short_name : '' }}{{env.station ? ' / ' +  env.station.name : '' }}</header>

        <navigator></navigator>

        <div class="container-fluid">

            <div class="row">
                <div class="col-sm">
                    <div class="ui" v-if="N.edit" >
                        <button @click="set_goal(g)" v-for="g in N.DGOAL" v-bind:class="N.dest.goal === g ? 'active':''">{{g}}</button>
                    </div>

                    <div v-if="N.edit">
                        <div v-if="N.dest.goal === N.DGOAL.STATION">
                            <input-station :id.sync="N.dest.st_id" label="target station"></input-station>
                        </div>

                        <div v-if="N.dest.goal ===  N.DGOAL.SYSTEM">
                            <input-system :id.sync="N.dest.sys_id" label="target system"></input-system>
                        </div>

                        <div v-if="N.dest.goal ===  N.DGOAL.BODY">
                            <input-body :id.sync="N.dest.body_id" label="target body (approach)"></input-body>
                        </div>

                        <div v-if="N.dest.goal === N.DGOAL.SURFACE">
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
    import Navigator from "../components/navigator";
    import {A} from '../components/alert';

    const N = {

        status: PILOT.status,
        dest: PILOT.dest,
        dest_align: '',
        edit: false,

        DGOAL: {
            SURFACE: 'surface',
            BODY: 'body',
            SYSTEM: 'system',
            STATION: 'station',
        },
    };

    export default {
        name: "navi",
        components: {InputSystem, InputStation, InputBody, Navigator},
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
                if (!N.dest.goal) N.dest.goal = N.DGOAL.SURFACE;
                N.edit = true;
            },
            dest_apply: function () {
                NET.send('dest-set', N.dest);
                N.edit = false;
            },
        }
    }

    NET.on('uni:dest-set', (dest) => {
        if (dest.f && dest.f.includes('/ER')) { N.edit = true; }
    });


</script>

<style lang="scss">
    @import "../styles/vars";

    // NAV MODULE

    #navi {
        .alert.info { margin-top: 2em}
    }
</style>

