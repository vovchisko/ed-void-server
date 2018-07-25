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
            <div class="row">
                <div class="col-sm">{{R.run.status}}</div>
                <div class="col-sm">{{R.run.c_down || 'GO!'}}</div>
                <div class="col-sm"></div>
            </div>
            <table class="pilots">
                <tr v-for="pilot in R.run.pilots">
                    <td>
                        <small>{{pilot.status}} <span>{{pilot.x > 0 ? ' - on the way' : ' - on position!'}}</span></small>
                        <b>{{pilot.pos}} - {{pilot._id.split('/')[1]}}</b>
                    </td>
                    <td>
                        <small>current point</small>
                        <b>{{pilot.p}}</b>
                    </td>
                    <td>
                        <small>score</small>
                        <b>{{pilot.score}}</b>
                    </td>
                </tr>
            </table>
            <button v-on:click="run_start()" v-if="R.run.status === 'setup' && PILOT.dest.x === 0">ready!</button>
            <button v-on:click="leave_run()" v-if="R.run.status === 'setup'">leave setup</button>
            <button v-on:click="leave_run()" v-if="R.run.status === 'running'">abandon race</button>
            <button v-on:click="leave_run()" v-if="R.run.status === 'complete'">complete race</button>

        </div>

        <!--<div class="row">
            <div class="col-sm">
                <pre>RUN {{R.run}}</pre>
            </div>
            <div class="col-sm">
                <pre>PILOT.DEST {{PILOT.dest}}</pre>
            </div>
        </div>-->
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


    const RUNNER = {
        JOINED: 'joined',
        READY: 'ready',
        IN: 'in-run',
        DEAD: 'dead',
        LEAVE: 'leave',
        FINISHED: 'finished',
        DISQILFIED: 'disquilified',
    };

    const RUNST = {
        SETUP: 'setup',
        RUNNING: 'running',
        COMPLETE: 'complete',
        CLOSED: 'closed',

    };


    const R = {
        run: {
            _id: null,
            track_id: null,
            status: null,
            name: null,
            host: null,
            pilots: [],
        },
        pos: null,
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
                NET.send('run-list');
            },
            new_run: function (track_id) {
                NET.send('run-new', {track_id: track_id});
            },
            join_run: function (run_id) {
                NET.send('run-join', {run_id: run_id});
            },
            run_start: function () {
                NET.send('run-ready');
            },
            leave_run: function () {
                if (this.R.run.status === RUNST.RUNNING) {
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
                } else {
                    NET.send('run-leave');
                }
            }
        }
    }

    NET.on('uni:run-upd', (run) => {

        R.run.pilots.splice(0, R.run.pilots.length);
        for (let i = 0; i < run.pilots.length; i++)
            apply_pilot(run.pilots[i]);

        R.run._id = run._id;
        R.run.track_id = run.track_id;
        R.run.status = run.status;
        R.run.name = run.name;
        R.run.host = run.host;
        R.run.c_down = run.c_down;
        R.run.pilots.sort((a, b) => a.ord - b.ord);
    });

    NET.on('uni:run-upd-cmdr', pilot => apply_pilot(pilot));

    function apply_pilot(pilot) {
        // todo: this is a problem. it's just an array.
        for (let i = 0; i < R.run.pilots.length; i++)
            if (R.run.pilots[i] && pilot._id === R.run.pilots[i]._id) {
                Vue.set(R.run.pilots, i, pilot);
                R.run.pilots.sort((a, b) => a.ord - b.ord);
                return;
            }


        R.run.pilots.push(pilot);
        R.run.pilots.sort((a, b) => a.ord - b.ord);
    }

    NET.on('uni:run-status', (r) => {
        for (let i = 0; i < R.runs.length; i++) {
            if (R.runs[i]._id === r._id) {
                if (r.status !== RUNST.SETUP) {
                    return R.runs.splice(i, 1);
                } else {
                    return Vue.set(R.runs, i, r);
                }
            }

        }
        R.runs.unshift(r);
    });

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