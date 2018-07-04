<template>
    <div id="app">
        <alert></alert>
        <auth></auth>

        <navbar v-if="MODE.is_ready"/>

        <div class="container-fluid" v-if="MODE.is_ready">
            <cmdr v-if="MODE.c_mode === 'cmdr'"></cmdr>
            <vass v-if="MODE.c_mode === 'vass'"></vass>
            <navi v-if="MODE.c_mode === 'navi'"></navi>
            <repo v-if="MODE.c_mode === 'repo'"></repo>
            <cfg v-if="MODE.c_mode === 'cfg'"></cfg>
            <dev v-if="MODE.c_mode === 'dev'"></dev>
        </div>

    </div>
</template>
<script>
    import moment from 'moment';
    import Vue from 'vue';

    import Alert, {A} from './components/alert'
    import Auth from './mods/auth.vue'
    import Navbar from './mods/navbar.vue'

    import CFG from './ctrl/cfg';
    import NET from './ctrl/network';
    import MODE from './ctrl/mode';
    import PILOT from './ctrl/pilot';

    import Cmdr from './mods/cmdr.vue'
    import Navi from './mods/navi.vue'
    import Vass from './mods/vass.vue'
    import Repo from './mods/repo.vue'
    import Cfg from './mods/cfg.vue'
    import Dev from './mods/dev.vue'

    export default {
        name: 'app',
        data: () => {return {MODE: MODE, CFG: CFG, A: A, PILOT: PILOT}},
        components: {
            Alert, Navbar, Auth, Cmdr, Navi, Vass, Repo, Cfg, Dev
        },
    }

    NET.on('uni:overload', (is_overload) => {
        if (is_overload) {
            A.lock({
                type: 'info progress',
                text: 'processing new data',
                desc: 'plase wait...',
            });
        } else {
            A.release();
        }
    });

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

    Vue.filter('date', function (value) {
        if (value) {
            return moment(String(value)).format('MM/DD/YYYY hh:mm')
        }
    });

</script>

<style lang="scss">
    @import '~bootstrap/dist/css/bootstrap-reboot.css';
    @import '~bootstrap/dist/css/bootstrap-grid.css';
    @import 'styles/fonts';
    @import 'styles/base';
    @import 'styles/fx';
</style>
