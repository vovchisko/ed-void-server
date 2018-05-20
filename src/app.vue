<template>
    <div id="app">
        <auth v-if="!data.auth.is_logged"></auth>
        <navbar v-if="data.auth.is_logged"/>
        <div class="container-fluid" v-if="data.auth.is_logged">
            <cmdr v-if=" data.modes.c_mode === 'cmdr'"></cmdr>
            <vass v-if="data.modes.c_mode === 'vass'"></vass>
            <navi v-if="data.modes.c_mode === 'navi'"></navi>
            <repo v-if="data.modes.c_mode === 'repo'"></repo>
            <dev v-if="data.modes.c_mode === 'dev'"></dev>
        </div>

        <div class="alert info modal progress" v-show="data.app.overload">
            <i class="i-ed-alert"></i>
            <div>recieving new data</div>
            <small>please wait</small>
        </div>
    </div>
</template>
<script>

    import Auth from './components/auth.vue'
    import Navbar from './components/navbar.vue'
    import Data from './services/data'
    import Net from './services/network';
    import Vue from 'vue'

    import Cmdr from './components/cmdr.vue'
    import Navi from './components/navi.vue'
    import Vass from './components/vass.vue'
    import Repo from './components/repo.vue'
    import Dev from './components/dev.vue'

    export default {
        name: 'app',
        data: () => {return {data: Data}},
        components: {
            Navbar, Auth, Cmdr, Navi, Vass, Dev, Repo
        },
    }

    Vue.config.productionTip = false;

    Vue.filter('nn', function (num, frac = 3, min_frac = 0, err = 'ERR!') {
        num = parseFloat(num);
        if (isNaN(num) || typeof num !== "number") return err;
        return (new Intl.NumberFormat('en-US', {
            maximumFractionDigits: frac,
            minimumFractionDigits: min_frac
        })).format(num);
    });

    Vue.filter('yn', function (value) {
        if (typeof value !== "boolean") return value;
        return value ? 'TRUE' : 'FALSE';
    });

    Vue.filter('isval', function (value) {
        return value ? value : 'FALSE';
    });

    Net.on('uni:overload', (is_overload) => {
        Data.app.overload = is_overload;
    });

</script>

<style lang="scss">
    @import '~bootstrap/dist/css/bootstrap-reboot.css';
    @import '~bootstrap/dist/css/bootstrap-grid.css';
    @import 'styles/fonts';
    @import 'styles/vars';
    @import 'styles/base';
</style>
