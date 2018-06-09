<template>
    <div id="dev">
        <header>
            <button v-for="t in tabs" v-on:click="c_tab = t" v-bind:class="t === c_tab ? 'active':''">{{t}}</button>
        </header>

        <pre v-if="c_tab === 'status'">{{status}}</pre>
        <pre v-if="c_tab === 'pipe'">{{pipe}}</pre>
        <pre v-if="c_tab === 'uni'">{{uni}}</pre>
    </div>
</template>

<script>
    import Data from '../services/data'
    import Net from '../services/network'

    const dev_data = {
        status: Data.cmdr.status,
        pipe: [],
        uni: [],
    };

    export default {
        name: "dev",
        data: () => {
            return {
                c_tab: 'status',
                tabs: ['status', 'uni', 'pipe'],
                data: Data,
                status: dev_data.status,
                pipe: dev_data.pipe,
                uni: dev_data.uni,
            }
        }
    }

    Net.on('net:any', (c, dat) => {
        let p = c.split(':')[0];
        if (p === 'uni') {
            dev_data.uni.unshift({c: c, dat: dat});
            if (dev_data.uni.length > 32) dev_data.uni.splice(-1);
        }

        if (p === 'pipe') {
            dev_data.pipe.unshift({c: c, dat: dat});
            if (dev_data.pipe.length > 32) dev_data.pipe.splice(-1);
        }

    });

</script>

<style lang="scss">

</style>