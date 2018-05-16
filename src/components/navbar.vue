<template>
    <div id="navbar" class="container-fluid">
        <div class="nav-right">
            <div v-bind:class="['net', net.error ? 'err':'', net.online]">
                <i class="i i-wifi" v-if="net.online === 'online'"></i>
                <i class="i i-wifi-alert" v-if="net.online === 'offline'"></i>
                <i class="i i-wifi-low" v-if="net.online === 'connecting'"></i>
            </div>
        </div>

        <div class="nav-left">
            <button v-on:click="m_toggle()" class=" mode" v-bind:class=" toggle? 'active': ''">
                MOD: {{nav.c_mode}}<i class="caret i-chevron-right"></i>
            </button>

            <nav v-if="toggle">
                <button v-for="mode in nav.modes" v-bind:class="nav.c_mode === mode ? 'semi-active':''" v-on:click="do_nav(mode)">{{mode}}</button>
            </nav>
        </div>

        <div id="nav-clickout" v-if="toggle" v-on:click="toggle=false"></div>
    </div>
</template>

<script>
    import Data from '../services/data';
    import Net from '../services/network';

    export default {
        name: 'navbar',
        data: () => {return {nav: Data.modes, net: Net.stat, toggle: false} },
        methods: {
            do_nav: function (t) {
                this.nav.c_mode = t;
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
    @import "../styles/vars";
    #navbar {
        height: 2.2rem;
        line-height: 2.2rem;
        margin-top: 0; margin-bottom: 0;
        padding-top: 0; padding-bottom: 0;

        //layout
        .nav-left { margin-top: 5px; float: left; white-space: nowrap; position: relative; z-index: 2; width: 7rem; }
        .nav-right { margin-top: 5px; float: right; width: 2rem; white-space: nowrap; }

        //styles
        button.mode {
            white-space: nowrap; width: 100%;
            .caret { font-size: 1.1rem; width: 0.7em; display: inline-block; }
            &.active .caret { }
        }
        nav {
            padding: 10px 0;
            position: absolute;
            top: 100%;
            left: 0; background: $ui-bg;
            z-index: 2;
            button {
                margin: 0 5px 5px 0; display: block; width: 7rem;
                span { display: inline}
            }
        }
        .net {
            padding: 1px 0;
            color: darken($ui-text, 15%);
            font-size: 1.3rem;
            line-height: 2.1rem;
            text-align: center;
            &.online { color: lighten($ui-fg, 15%); }
            &.offline { color: $purple; }
            &.connecting { color: $purple; }
            &.err { color: darken($red, 15%); }

        }
        .nav-header {
            padding: 1px 5px; text-transform: uppercase; color: lighten($ui-text, 15%);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis; }

        #nav-clickout { position: fixed; left: 0; top: 0; right: 0; bottom: 0; background-color: $ui-bg; opacity: 0.5; z-index: 1}
    }
</style>
