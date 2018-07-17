<template>
    <div class="run">
        <header v-if="!PILOT.cmdr.run_id">
            <button v-on:click="c_tab = 'runs'" v-bind:class="c_tab ==='runs'?'active':''">active runs</button>
            <button v-on:click="c_tab = 'tracks'" v-bind:class="c_tab ==='tracks'?'active':''">tracks</button>
        </header>
        <header v-if="PILOT.cmdr.run_id">
            {{R.run.name}}
        </header>
        <div class="container-fluid" v-if="c_tab==='runs' && !PILOT.cmdr.run_id">
            <h5>active runs
                <button v-on:click="get_runs()">refresh</button>
            </h5>
            <div v-for="r in R.runs">
                <hr>
                <pre>{{r}}</pre>
                <button v-on:click="join_run(r._id)">join</button>
            </div>

        </div>
        <div class="container-fluid" v-if="c_tab==='tracks' && !PILOT.cmdr.run_id">
            <h3>tracks</h3>
            <div class="tracks">
                <div v-for="track in R.tracks" class="track">
                    <div class="row">
                        <div class="col-sm-8 listed">
                            <h4>{{track.name}} <span>{{track.type}}</span></h4>
                            <p>{{track.desc}}</p>
                            <em><b>vehicle</b><span>{{track.vehicle}}</span></em>
                            <em><b>sponsor</b><span>{{track.sponsor}}</span></em>
                        </div>
                        <div class="col-sm-2">
                            <button v-on:click="new_run(track._id)"><i class="i-wind"></i> START RUN</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="active-run" v-if="PILOT.cmdr.run_id">
            <navigator></navigator>
            <table class="pilots">
                <tr v-for="p in R.run.pilots">
                    <td>
                        <small>{{p.status}} <span v-if="R.run.status===0">{{p.x > 0 ? ' - on the way' : ' - ready!'}}</span></small>
                        <b>{{p.pos}} - CMDR {{p.name}}</b>
                    </td>
                    <td>
                        <small>c_point</small>
                        <b>{{p.c_point}}</b>
                    </td>
                    <td>
                        <small>score</small>
                        <b>{{p.score}}</b>
                    </td>
                </tr>
            </table>
            <button v-on:click="run_start()" v-if="PILOT.dest.x === 0 && R.run.status === 0 && PILOT.cmdr._id === R.run.cmdr_id">run!</button>
            <button v-on:click="leave_run()" v-if="R.run.status === 0">leave setup</button>
            <button v-on:click="leave_run()" v-if="R.run.status === 1">abandon race</button>
            <button v-on:click="leave_run()" v-if="R.run.status === 2">complete race</button>

        </div>

        <!--div class="row">
            <div class="col-sm">
                <pre>RUN {{R.run}}</pre>
            </div>
            <div class="col-sm">
                <pre>PILOT.DEST {{PILOT.dest}}</pre>
            </div>
        </div-->
    </div>
</template>

<script>
    import Vue from 'vue'
    import Navigator from '../components/navigator'
    import {A} from '../components/alert'
    import NET from '../ctrl/network'
    import PILOT from '../ctrl/pilot'
    import Starpos from "../components/star-pos";
    import tools from "../ctrl/tools";

    const R = {
        run: {
            _id: null,
            track_id: null,
            status: null,
            name: null,
            cmdr_name: null,
            cmdr_id: null,
            pilots: [],
            points: [],
        },
        runs: [],
        tracks: [],
    };

    export default {
        name: "run",
        components: {Starpos, Navigator},
        data: () => {
            return {
                c_tab: 'runs',
                R: R,
                PILOT: PILOT,
            }
        },
        mounted: function () {
            if (!this.R.tracks || !this.R.tracks.length) { this.get_tracks(); }
            this.get_runs();
        },
        methods: {
            get_tracks: function () {
                NET.api('s-tracks')
                    .then((res) => {
                        if (res.result) {
                            this.R.tracks.splice(0, this.R.tracks.length);
                            res.tracks.forEach(r => this.R.tracks.push(r));
                        } else {
                            A.error(res);
                        }
                    }).catch((err) => { console.log('s-tracks', err)});
            },
            get_runs: function () {
                NET.send('run-list', {});
            },
            new_run: function (track_id) {
                NET.send('run-new', {track_id: track_id});
            },
            join_run: function (run_id) {
                NET.send('run-join', {run_id: run_id});
            },
            run_start: function () {
                NET.send('run-start');
            },
            leave_run: function () {
                if (this.R.run.status === 0) NET.send('run-leave');
                if (this.R.run.status === 1) {
                    return A.warn({
                        text: 'are you sure that you want to leave?',
                        desc: 'it will discard all your current race score and affect statisctic',
                        acts: {
                            'yes, leave': () => {
                                NET.send('run-leave');
                            },
                            'cancel': null
                        }
                    })
                }
                if (this.R.status === 2) NET.send('run-leave');

            }
        }
    }

    NET.on('uni:run-upd', (run) => {

        R.run.pilots.splice(0, R.run.pilots.length);
        for (let i in run.pilots)
            apply_pilot(run.pilots[i]);

        R.run._id = run._id;
        R.run.track_id = run.track_id;
        R.run.status = run.status;
        R.run.name = run.name;
        R.run.cmdr_name = run.cmdr_name;
        R.run.cmdr_id = run.cmdr_id;
        R.run.pilots.sort((a, b) => a.pos - b.pos);
    });

    NET.on('uni:run-upd-cmdr', apply_pilot);

    function apply_pilot(pilot) {
        // todo: this is a problem. it's just an array.
        // let's drop points (semt it only once or something) and re-fill this list well
        for (let i = 0; i < R.run.pilots.length; i++)
            if (pilot.id === R.run.pilots[i].id) {
                Vue.set(R.run.pilots, i, pilot);
                R.run.pilots.sort((a, b) => a.pos - b.pos);
                return;
            }


        R.run.pilots.push(pilot);
        R.run.pilots.sort((a, b) => a.pos - b.pos);
    }

    NET.on('uni:run-list', (runs) => {
        R.runs.splice(0, R.runs.length);
        runs.forEach(r => R.runs.push(r));
    });

</script>

<style lang="scss">
    @import '../styles/vars';
    .tracks {
        .track { padding: 0.5em 0; margin: 0.5em 0; border-top: 1px solid darken($ui-fg, 50%)}
    }
    .active-run {
        .pilots {
            margin-top: 1em;
            width: 100%;
            @include hcaps();
            b { color: $orange; }
            small { display: block}
            td { padding: 0.3em 0}
        }
    }
</style>