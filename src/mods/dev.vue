<template>
    <div id="dev">
        <header>
            <button v-for="t in tabs" v-on:click="c_tab = t" v-bind:class="t === c_tab ? 'active':''">{{t}}</button>
        </header>

        <pre v-if="c_tab === 'data'">{{data}}</pre>
        <pre v-if="c_tab === 'pipe'">no pipe data yet</pre>
        <pre v-if="c_tab === 'uni'">no uni data yet</pre>
        <pre v-if="c_tab === 'net'">{{network}}</pre>
    </div>
</template>

<script>
    import Data from '../services/data'
    import Net from '../services/network'

    const network = {
        uni: [],
        pipe: [],
        status: []
    };

    export default {
        name: "dev",
        data: () => {
            return {
                c_tab: 'stat',
                tabs: ['stat', 'uni', 'pipe'],
                data: Data,
                network: network
            }
        }
    }

    Net.on('net:any', (c, dat) => {

        console.log(c, dat);
    });


</script>

<style lang="scss">

</style>