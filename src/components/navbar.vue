<template>
    <div id="navbar" class="container-fluid">
        <div class="nav-left">
            <button v-on:click="m_toggle()" class=" mode" v-bind:class=" toggle? 'active': ''">
                MOD: {{nav.c_tab}}
            </button>
        </div>
        <div class="nav-mid">
            <nav v-if="toggle">
                <button v-for="(tab, key) in nav.tabs" v-on:click="do_nav(key)">{{key}}</button>
            </nav>

            <div v-if="!toggle">
                <div class="nav-header" v-if="!nav.tabs[nav.c_tab].inject">{{nav.tabs[nav.c_tab].base}}</div>
                <div class="nav-header inject" v-if="nav.tabs[nav.c_tab].inject"
                     v-html="nav.tabs[nav.c_tab].inject"></div>
            </div>
        </div>
        <div class="nav-right">
            <div v-bind:class="['net', net.error ? 'err':'']">
                NET::<span v-bind:class="net.online"></span>
            </div>
        </div>
    </div>
</template>

<script>
    import Data from '../services/data';
    import Net from '../services/network';

    export default {
        name: 'navbar',
        data: () => {return {nav: Data.tabs, net: Net.stat, toggle: false} },
        methods: {
            do_nav: function (t) {
                this.nav.c_tab = t;
                this.m_toggle(false);
                Data.save();
            },
            m_toggle: function (t = null) {
                if (t === null) return this.toggle = !this.toggle;
                this.toggle = t;
            }
        }
    }
</script>

<style lang="scss">

</style>
