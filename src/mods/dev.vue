<template>
    <div id="dev">
        <header>
            <button v-for="t in tabs" v-on:click="c_tab = t" v-bind:class="t === c_tab ? 'active':''">{{t}}</button>
        </header>

        <div v-if="c_tab === 'log'">
            <pre v-for="l in log">{{l[0]}} : {{l[1]}}</pre>
        </div>

        <div v-if="c_tab === 'stat'" class="container-fluid">
            <div class="row">
                <div class="col-sm">
                    <pre>PILOT:STAT {{PILOT.status}}</pre>
                </div>
                <div class="col-sm">
                    <pre>PILOT:DEST {{PILOT.dest}}</pre>
                </div>
                <div class="col-sm">
                    <pre>CFG: {{CFG}}</pre>
                </div>

            </div>
        </div>

        <div v-if="c_tab === 'pipe'">
            <pre>{{pipe}}</pre>
        </div>
        <div v-if="c_tab === 'uni'">
            <pre>{{uni}}</pre>
        </div>

        <div v-if="c_tab === 'test'">
            <pre>TEST: {{test}}</pre>
            <button v-on:click="external_change()">PEW!</button>
            <br>

            <input-body v-bind:id.sync="test.body_id" label="target body"></input-body>
            <input-system v-bind:id.sync="test.system_id" label="target system"></input-system>

        </div>

    </div>
</template>

<script>
    import NET from '../ctrl/network'
    import PILOT from '../ctrl/pilot'
    import CFG from '../ctrl/cfg'

    import InputBody from '../components/input-body'
    import InputSystem from '../components/input-system'
    import InputStation from '../components/input-station'

    const dev = {
        pipe: [],
        uni: [],
        log: [],
    };

    export default {
        name: "dev",
        components: {InputBody, InputSystem, InputStation},
        data: () => {
            return {
                c_tab: 'test',
                tabs: ['test', 'log', 'stat', 'uni', 'pipe'],
                PILOT: PILOT, CFG: CFG,
                log: dev.log,
                stat: dev.stat,
                pipe: dev.pipe,
                uni: dev.uni,
                test: {
                    system_id: 'apoyota@-1078:-139:1964',
                    body_id: 'apoyota@-1078:-139:1964/*',
                },
            }
        },
        methods: {
            on_change: function (e) {
                console.log('PEW!', e);
            },

            external_change: function () {
                this.test.system_id = 'apoyota@-1078:-139:1964'
                this.test.body_id = 'apoyota@-1078:-139:1964/*'
            }

        }
    }

    NET.on('ping', (dat) => {
        let log = dev.log;
        let lag = 0;
        if (log.length)
            lag = dat.t - log[0][0];
        log.unshift([parseInt(dat.t), lag || 0]);
        if (log.length > 32) log.splice(log.length - 1, 1)
    });

    NET.on('net:any', (c, dat) => {
        let p = c.split(':')[0];
        if (p === 'uni') {
            dev.uni.unshift({c: c, dat: dat});
            if (dev.uni.length > 32) dev.uni.splice(-1);
        }

        if (p === 'pipe') {
            dev.pipe.unshift({c: c, dat: dat});
            if (dev.pipe.length > 32) dev.pipe.splice(-1);
        }
    });

</script>

<style lang="scss">

</style>