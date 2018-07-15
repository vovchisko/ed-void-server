<template>
    <div class="run">
        <header v-if="!cmdr.run_id">
            <button v-on:click="c_tab = 'runs'" v-bind:class="c_tab ==='runs'?'active':''">active runs</button>
            <button v-on:click="c_tab = 'tracks'" v-bind:class="c_tab ==='tracks'?'active':''">tracks</button>
        </header>
        <header v-if="cmdr.run_id">
            {{run.name}}
        </header>
        <div class="container-fluid" v-if="c_tab==='runs' && !cmdr.run_id">
            <h5>active runs
                <button v-on:click="get_runs()">refresh</button>
            </h5>
            <div v-for="run in runs">
                <hr>
                <pre>{{run}}</pre>
                <button v-on:click="join_run(run._id)">join</button>
            </div>

        </div>
        <div class="container-fluid" v-if="c_tab==='tracks'  && !cmdr.run_id">
            <h5>tracks
                <button v-on:click="get_tracks()">refresh</button>
            </h5>
            <div class="tracks">
                <div v-for="track in tracks" class="track">
                    <h3>{{track.name}}</h3>
                    <div>{{track.points[0]}}</div>
                    <button v-on:click="new_run(track._id)">new run</button>
                </div>
            </div>
        </div>
        <div class="active-run" v-if="cmdr.run_id">
            <navigator></navigator>
            <button v-on:click="leave_run()">give up</button>
        </div>

        <div class="row">
            <div class="col-sm">
                <pre>PILOT:STAT {{status}}</pre>
            </div>
            <div class="col-sm">
                <pre>PILOT:DEST {{dest}}</pre>
            </div>
            <div class="col-sm">
                <pre>PILOT:CMDR {{cmdr}}</pre>
            </div>
        </div>
    </div>
</template>

<script>
    import Navigator from '../components/navigator'
    import {A} from '../components/alert'
    import NET from '../ctrl/network'
    import PILOT from '../ctrl/pilot'

    const RUN = {
        name: 'undefined Race',
        cmdr_name: 'Joe Undefined',
        start: {},
        finish: {},
    };
    const RUNS = [];
    const TRACKS = [];


    export default {
        name: "run",
        components: {Navigator},
        data: () => {
            return {
                c_tab: 'runs',
                run: RUN,
                runs: RUNS,
                tracks: TRACKS,
                cmdr: PILOT.cmdr,
                dest: PILOT.dest,
                status: PILOT.status,
            }
        },
        mounted: function () {
            if (!this.tracks || !this.tracks.length) { this.get_tracks(); }
            this.get_runs();
        },
        methods: {
            get_tracks: function () {
                NET.api('s-tracks')
                    .then((res) => {
                        if (res.result) {
                            this.tracks.splice(0, this.tracks.length);
                            res.tracks.forEach(r => this.tracks.push(r));
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

    NET.on('uni:run-list', (runs) => {
        RUNS.splice(0, RUNS.length);
        runs.forEach(r => RUNS.push(r));
    });

</script>

<style lang="scss">

</style>