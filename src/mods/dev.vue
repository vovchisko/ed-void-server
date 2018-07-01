<template>
    <div id="dev">
        <header>
            <button v-for="t in tabs" v-on:click="c_tab = t" v-bind:class="t === c_tab ? 'active':''">{{t}}</button>
        </header>

        <div v-if="c_tab === 'log'">
            <div v-for="l in log">{{l}}</div>
        </div>
        <pre v-if="c_tab === 'stat'">{{stat}}</pre>
        <pre v-if="c_tab === 'pipe'">{{pipe}}</pre>
        <pre v-if="c_tab === 'uni'">{{uni}}</pre>
    </div>
</template>

<script>
    import Data from '../ctrl/data'
    import Net from '../ctrl/network'

    const dev = {
        stat: Data.cmdr.status,
        pipe: [],
        uni: [],
        log: [],
    };

    export default {
        name: "dev",
        data: () => {
            return {
                c_tab: 'log',
                tabs: ['log', 'stat', 'uni', 'pipe'],
                data: Data,
                log: dev.log,
                stat: dev.stat,
                pipe: dev.pipe,
                uni: dev.uni,
            }
        }
    }

    Net.on('ping', (dat) => {
        let log = dev.log;
        let lag = 0;

        if (log.length)
            lag = dat.t - log[0][0];
        log.unshift([parseInt(dat.t), lag || 0]);
        if (log.length > 32) log.splice(log.length - 1, 1)
    });

    Net.on('net:any', (c, dat) => {
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