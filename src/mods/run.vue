<template>
    <div class="run">
        <header v-if="!PILOT.cmdr.run_id">
            <button v-on:click="c_tab = 'runs'" v-bind:class="c_tab ==='runs'?'active':''">active runs</button>
            <button v-on:click="c_tab = 'tracks'" v-bind:class="c_tab ==='tracks'?'active':''">tracks</button>
        </header>
        <header v-if="PILOT.cmdr.run_id">
            {{R.run.name}}
        </header>
        
        <!-- TRACKS -->
        
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
        
        <!-- RUN LIST IN SETUP  -->
        
        <div class="container-fluid runs" v-if="c_tab==='runs' && !PILOT.cmdr.run_id">
            <h5>active runs &nbsp;
                <button v-on:click="get_runs()" class="link"><i class="i-sync"></i> refresh</button>
            </h5>
            
            <div v-if="!R.runs.length" class="alert edfx">
                <br>
                <i class="i-ed-alert"></i>
                <h3>no active runs found</h3>
                <p>you can host one from TRACKS section</p>
            </div>
            
            <div v-if="R.runs.length">
                <div class="row run-item" v-for="r in R.runs">
                    <div class="col-sm">
                        <small>run track</small>
                        <b>{{r.name}}</b>
                        <small>by: cmdr {{r.host.split('/')[1]}}</small>
                        <star-dist :dest="r.loc.st_id || r.loc.sys_id || r.loc.body_id"
                                   :pos="PILOT.cmdr.sys_id"></star-dist>
                    </div>
                    <div class="col-sm">
                        <small>racers ({{r.pilots.length}})</small>
                        <span v-for="pilot in r.pilots">CMDR {{pilot._id.split('/')[1]}}<br></span>
                    </div>
                    <div class="col-sm">
                        <small>run state</small>
                        {{r.status}}: READY {{r.count_ready}}/{{r.pilots.length}}
                    </div>
                    <div class="col-sm">
                        <button v-on:click="join_run(r._id)"><i class="i-wind"></i> join run</button>
                    </div>
                </div>
            </div>
        
        </div>
        
        <!-- ACTIVE RUN  -->
        
        <div class="active-run" v-if="PILOT.cmdr.run_id">
            <navigator></navigator>
            
            <div class="run-status">
                <div v-if="R.run.status === R.RUNST.SETUP">
                    <h2 v-if="R.run.c_down===null">run setup</h2>
                    <h2 v-if="R.run.c_down!==null">{{R.run.c_down}}</h2>
                </div>
                <div v-if="R.run.status === R.RUNST.RUNNING">
                    <h2>{{PILOT.dest.name || 'RUN!'}}</h2>
                </div>
                <div v-if="R.run.status === R.RUNST.COMPLETE">
                    <h2>run complete</h2>
                </div>
                
            </div>
            <div class="run-pilots">
                <div class="row" v-for="pilot in R.run.pilots">
                    <div class="col-sm">
                        <b>{{pilot.pos}} - {{pilot._id.split('/')[1]}}</b>
                    </div>
                    <div class="col-sm">
                        <span v-if="pilot.x > 0">DIST:
                            <star-dist v-if="pilot.x > 0"
                                       :dest="R.run.loc.st_id || R.run.loc.sys_id ||R.run.loc.body_id"
                                       :pos="pilot.sys_id"></star-dist></span>
                        <span v-if="pilot.x <= 0">{{pilot.status}}</span>
                    </div>
                    <div class="col-sm">
                        {{pilot.score}} Pt
                    </div>
                </div>
            </div>
            
            <button v-on:click="run_start()" v-if="R.run.status === 'setup' && PILOT.dest.x === 0">ready!</button>
            <button v-on:click="leave_run()" v-if="R.run.status === 'setup'">leave setup</button>
            <button v-on:click="leave_run()" v-if="R.run.status === 'running'">abandon race</button>
            <button v-on:click="leave_run()" v-if="R.run.status === 'complete'">complete race</button>
        
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
    import StarPos from "../components/star-pos";
    import StarDist from "../components/star-dist";
    import tools from "../ctrl/tools";

    const R = {
        RUNST: {
            SETUP: 'setup',
            RUNNING: 'running',
            COMPLETE: 'complete',
            CLOSED: 'closed',

        },
        RUNNER: {
            JOINED: 'pending',
            READY: 'ready',
            IN: 'in-run',
            DEAD: 'dead',
            LEAVE: 'leave',
            FINISHED: 'finished',
            DISQILFIED: 'disquilified',
        },
        run: {
            _id: null,
            track_id: null,
            status: null,
            name: null,
            host: null,
            pilots: [],
            count_ready: 0,
        },
        pos: null,
        runs: [],
        tracks: [],
    };

    export default {
        name: "run",
        components: {StarPos, StarDist, Navigator},
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
                console.log(get_my_pilot());
                NET.send('run-ready', !(get_my_pilot().status === R.RUNNER.READY));
            },
            leave_run: function () {
                if (this.R.run.status === R.RUNST.RUNNING) {
                    return A.warn({
                        text: 'are you sure that you want to leave?',
                        desc: 'it will discard all your current race score and affect statisctic',
                        acts: {
                            'yes, leave': () => NET.send('run-leave'),
                            'cancel': null
                        }
                    })
                } else {
                    NET.send('run-leave');
                }
            }
        }
    }

    function get_my_pilot() {
        for (let i = 0; i < R.run.pilots.length; i++)
            if (PILOT.cmdr._id === R.run.pilots[i]._id)
                return R.run.pilots[i];
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
        R.run.count_ready = 0;

        Vue.set(R.run, 'loc', run.loc);
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
        r.count_ready = 0;
        for (let i in r.pilots) if (r.pilots[i].status === R.RUNNER.READY) r.count_ready++;

        for (let i = 0; i < R.runs.length; i++) {
            if (R.runs[i]._id === r._id) {
                if (r.status !== R.RUNST.SETUP) {
                    return R.runs.splice(i, 1);
                } else {
                    return Vue.set(R.runs, i, r);
                }
            }

        }
        if (r.status === R.RUNST.SETUP) R.runs.unshift(r);
    });

    NET.on('uni:run-list', (runs) => {
        R.runs.splice(0, R.runs.length);
        runs.forEach((r) => {
            R.runs.push(r);
            r.count_ready = 0;
            for (let i in r.pilots) if (r.pilots[i].status === R.RUNNER.READY) r.count_ready++;
        });
    });

</script>

<style lang="scss">
    @import '../styles/vars';
    .tracks {
        .track { padding: 0.5em 0; margin: 0.5em 0; border-top: 1px solid darken($ui-fg, 50%)}
    }
    .run-status {
        text-align: center;
        padding: 0;
        @include hcaps();
        h2 { font-size: 2em; line-height: 1.1em; }
        
    }
    .run-pilots {
        padding: 1em 0;
        @include hcaps();
        b { color: $orange; font-weight: normal }
    }
    .run-item {
        &:last-of-type { border-bottom: 1px solid #1e1e23; }
        padding-top: 1em;
        border-top: 1px solid #1e1e23;
        margin-top: 1em;
        @include hcaps();
        b { color: $orange; font-weight: normal }
        small { display: block; line-height: 1em; color: lighten($ui-text, 15%); padding-bottom: 0.3em }
        div { padding-bottom: 0.5em}
    }

</style>