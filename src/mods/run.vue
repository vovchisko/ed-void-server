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
            <h5>tracks
                <button v-on:click="get_tracks()">refresh</button>
            </h5>
            <div class="tracks">
                <div v-for="track in R.tracks" class="track">
                    <h3>{{track.name}}</h3>
                    <div>{{track.points[0]}}</div>
                    <button v-on:click="new_run(track._id)">new run</button>
                </div>
            </div>
        </div>

        <div class="active-run" v-if="PILOT.cmdr.run_id">
            <navigator></navigator>
            <pre> {{R.run}}</pre>
            <button v-on:click="leave_run()">give up</button>
        </div>
        <br>
        <br>
        <br>

        <button v-on:click="dev = !dev">dev stuff</button>
        <div class="row" v-if="dev">
            <div class="col-sm">
                <pre>RUN {{R.run}}</pre>
            </div>
            <div class="col-sm">
                <pre>PILOT:STAT {{PILOT.status}}</pre>
            </div>
            <div class="col-sm">
                <pre>PILOT:DEST {{PILOT.dest}}</pre>
            </div>
            <div class="col-sm">
                <pre>PILOT:CMDR{{PILOT.cmdr}}</pre>
            </div>

        </div>
    </div>
</template>

<script>
    import Vue from 'vue'
    import Navigator from '../components/navigator'
    import {A} from '../components/alert'
    import NET from '../ctrl/network'
    import PILOT from '../ctrl/pilot'


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
        components: {Navigator},
        data: () => {
            return {
                dev: false,
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
            leave_run: function (run_id) {
                A.warn({
                    text: 'are you sure that you want to leave?',
                    desc: 'it will counts as fail for you as rece already started',
                    acts: {
                        'yes, leave': () => {
                            NET.send('run-leave');
                        },
                        'cancel': null
                    }
                })
            }
        }
    }

    NET.on('uni:run-upd', (run) => {
        if (run._id !== R.run._id) { //another race
            R.run.pilots.splice(0, R.run.pilots.length);
            R.run.points.splice(0, R.run.points.length);
            R.run.points.concat(run.points);
        }
        R.run._id = run._id;
        R.run.track_id = run.track_id;
        R.run.status = run.status;
        R.run.name = run.name;
        R.run.cmdr_name = run.cmdr_name;
        R.run.cmdr_id = run.cmdr_id;
        for (let i in run.pilots) {
            apply_pilot(run.pilots[i]);
        }
    });

    NET.on('uni:run-upd-cmdr', apply_pilot);

    function apply_pilot(pilot) {
        for (let i = 0; i < R.run.pilots.length; i++)
            if (pilot.id === R.run.pilots[i].id)
                return Vue.set(R.run.pilots, i, pilot);

        R.run.pilots.push(pilot);
    }

    NET.on('uni:run-list', (runs) => {
        R.runs.splice(0, R.runs.length);
        runs.forEach(r => R.runs.push(r));
    });

</script>

<style lang="scss">

</style>