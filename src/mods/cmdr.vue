<template>
    <div id="cmdr">
        <header>
            CMDR PROFILE
        </header>

        <h1>pilot profile</h1>
        <em><b>CMDR</b><span>{{cmdr.name}}</span></em>
        <em><b>SYSTEM</b>
            <span>
                {{env.system ? env.system.name : 'N / A'}}
                <small v-if="env.system"><u v-for="x in env.system.starpos">{{x/32}}; </u></small>
            </span>
        </em>
        <em><b>LOC</b><span>{{env.body ? env.body.name : 'Deep Space'}}</span></em>

    </div>
</template>

<script>
    import Data from '../services/data';
    import Net from '../services/network';
    import Vue from 'vue';
    import extend from 'deep-extend';

    export default {
        name: 'cmdr',
        data: () => { return {cmdr: Data.cmdr,  env: Data.env}},
        methods: { }
    }


    Net.on('uni:status', (status) => {
        if (!status) return false;
        extend(Data.cmdr.status, status);
    });

    Net.on('uni:cmdr', (cmdr) => {
        if (!cmdr) return false;
        extend(Data.cmdr, cmdr);
    });



    Net.on('uni:c_system', (system) => Vue.set(Data.env, 'system', system));
    Net.on('uni:c_body', (body) => Vue.set(Data.env, 'body', body));

</script>

<style lang="scss">
    @import '../styles/vars';
    #cmdr {
        h3 { margin-top: 1em}

    }
</style>