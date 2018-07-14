<template>
    <div class="run">
        <header>
            <button v-on:click="c_tab = 'run'" v-bind:class="c_tab ==='run'?'active':''">run</button>
            <button v-on:click="c_tab = 'tracks'" v-bind:class="c_tab ==='tracks'?'active':''">tracks</button>
        </header>
        <div class="container-fluid">
            <navigator></navigator>
            <div class="row">
                <div class="col-sm">
                    <h5>tracks
                        <button v-on:click="get_tracks()">refresh</button>
                    </h5>
                    <div v-for="track in RUN.tracks">
                        <hr>
                        {{track.name}}, {{track.points[0]}}
                        <button v-on:click="new_run(track._id)">new run</button>
                    </div>
                </div>
                <div class="col-sm">
                    <h5>active runs
                        <button v-on:click="get_runs()">refresh</button>
                    </h5>
                    <div v-for="run in RUN.runs">
                        <hr>
                        <pre>{{run}}</pre>
                        <button v-on:click="join_run(run._id)">join</button>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-sm">
                    <pre>PILOT:STAT {{PILOT.status}}</pre>
                </div>
                <div class="col-sm">
                    <pre>PILOT:DEST {{PILOT.dest}}</pre>
                </div>
                <div class="col-sm">
                    <pre>PILOT:CMDR {{PILOT.cmdr}}</pre>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
    import Navigator from '../components/navigator'
    import NET from '../ctrl/network'
    import PILOT from '../ctrl/pilot'

    const RUN = {
        in_race: false,
        is_host: false,
        tracks: [],
        runs: [],
    };

    export default {
        name: "run",
        components: {Navigator},
        data: () => {
            return {
                c_tab: 'run',
                RUN: RUN,
                PILOT: PILOT,
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
                            RUN.tracks.splice(0, RUN.tracks.length);
                            res.tracks.forEach(r => RUN.tracks.push(r));
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
            }

        }
    }

    NET.on('uni:run-list', (runs) => {
        RUN.runs.splice(0, RUN.runs.length);
        runs.forEach(r => RUN.runs.push(r));
    });

</script>

<style lang="scss">

</style>