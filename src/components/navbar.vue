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
            <span v-bind:class="['net', net.error ? 'err':'', net.online]">
                <i class="i i-wifi" v-if="net.online === 'online'"></i>
                <i class="i i-wifi-alert" v-if="net.online === 'offline'"></i>
                <i class="i i-wifi-low" v-if="net.online === 'connecting'"></i>
            </span>
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
    @import "../styles/vars";

    #navbar {
        //layout
        display: flex;
        .nav-left {flex: 1; white-space: nowrap; }
        .nav-mid {flex: 3 100%; }
        .nav-right {flex: 1; white-space: nowrap; }

        line-height: 2rem;

        //styles
        button.mode { white-space: nowrap;
            .caret { }
            &.active .caret { }
        }
        nav {
            padding: 0 5px;
            button { margin: 0 5px 0 0;
                span { display: inline}
            }
        }
        .net {
            color: darken($ui-text, 25%);
            padding: 1px .3rem;
            font-size: 1rem;
            text-transform: uppercase;
            text-align: right;
            white-space: nowrap;
            &.err { color: darken($red, 15%); }

            span {
                text-align: left;
                color: $ui-fg;
                display: inline-block;
                &.online:before {content: "ok"; color: $ui-fg; }
                &.offline:before {content: "off"; color: $orange; }
                &.connecting:before {content: "..."; color: $ui-fg; }
            }
        }
        .nav-header {
            padding: 1px 5px; text-transform: uppercase; color: lighten($ui-text, 15%);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis; }
    }
</style>
