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
            <input-body v-model="test.id" id="999"></input-body>
            <pre>TEST: {{test}}</pre>

        </div>

    </div>
</template>

<script>
    import NET from '../ctrl/network'
    import PILOT from '../ctrl/pilot'
    import CFG from '../ctrl/cfg'

    import InputBody from '../components/input-body'

    const dev = {
        pipe: [],
        uni: [],
        log: [],
    };

    export default {
        name: "dev",
        components: {InputBody},
        data: () => {
            return {
                c_tab: 'test',
                tabs: ['test', 'log', 'stat', 'uni', 'pipe'],
                PILOT: PILOT, CFG: CFG,
                log: dev.log,
                stat: dev.stat,
                pipe: dev.pipe,
                uni: dev.uni,
                test: {search: '', body: {}, id: 'mundii@1'},
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