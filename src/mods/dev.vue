<template>
    <div id="dev">
        <header>
            <button v-for="t in tabs" v-on:click="c_tab = t" v-bind:class="t === c_tab ? 'active':''">{{t}}</button>
            <button @click="toggle_overlay()">OV</button>
            <button @click="toggle_interact()">INT</button>
        </header>
        
        <div v-if="c_tab === 'stat'">
            <div class="row">
                <div class="col-sm">
                    <pre>PILOT.DEST: {{PILOT.dest}}</pre>
                </div>
                <div class="col-sm">
                    <pre>PILOT.CMDR: {{PILOT.cmdr}}</pre>
                </div>
                <div class="col-sm">
                    <pre>CFG: {{CFG}}</pre>
                </div>
                <div class="col-sm">
                    <pre>MODE: {{MODE}}</pre>
                </div>
            </div>
        </div>
        
        <div class="container-fluid" v-if="c_tab === 'test'">
            <div class="ov ov-nav">ov-nav
                <div class="alert info edfx">
                    <i class="i-ed-alert"></i>
                    <h4>ui-block postion example</h4>
                </div>
            </div>
            <div class="ov ov-top-line ov-solid">top-line
                <div class="alert info edfx">
                    <i class="i-ed-alert"></i>
                    <h4>ui-block postion example</h4>
                </div>
            </div>
            <div class="ov ov-right-top">right-top
                <div class="alert info edfx">
                    <i class="i-ed-alert"></i>
                    <h4>ui-block postion example</h4>
                </div>
            </div>
            <div class="ov ov-right ov-solid">right
                <div class="alert info edfx">
                    <i class="i-ed-alert"></i>
                    <h4>ui-block postion example</h4>
                </div>
            </div>
            <div class="ov ov-left-top">left-top
                <div class="alert info edfx">
                    <i class="i-ed-alert"></i>
                    <h4>ui-block postion example</h4>
                </div>
            </div>
            <div class="ov ov-left ov-solid">left
                <div class="alert info edfx">
                    <i class="i-ed-alert"></i>
                    <h4>ui-block postion example</h4>
                </div>
            </div>
            <div class="ov ov-center ">center
                <div class="alert info edfx">
                    <i class="i-ed-alert"></i>
                    <h4>ui-block postion example</h4>
                </div>
            </div>
            <div class="ov ov-center-long ov-solid">center-long
                <div class="alert info edfx">
                    <i class="i-ed-alert"></i>
                    <h4>ui-block postion example</h4>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import PILOT from '../ctrl/pilot'
    import CFG from '../ctrl/cfg'
    import MODE from '../ctrl/mode';
    import Navigator from "../components/navigator";
    import Destination from "../components/destination";
    import CurrPosition from "../components/curr-position";

    const dev = {
        pipe: [],
        uni: [],
        log: [],
    };

    export default {
        name: "dev",
        components: {CurrPosition, Destination, Navigator},

        data: () => {
            return {
                c_tab: 'test',
                tabs: ['test', 'stat'],
                MODE: MODE,
                PILOT: PILOT,
                CFG: CFG,
            }
        },
        methods: {
            toggle_overlay: function () { MODE.is_overlay = !MODE.is_overlay; },
            toggle_interact: function () { MODE.is_interact = !MODE.is_interact; }
        }
    }
    MODE.is_overlay = true;
    MODE.is_interact = true;
</script>

<style lang="scss">
    
    body {background-image: url('../../public/assets/overlay-test/6.jpg') !important; background-size: contain !important; background-position: 50% !important; background-repeat: no-repeat !important;}
    #app[overlay='on'] {
        * { text-shadow: 0 1px 3px #00000044}
        height: 100%;
        width: 100%;
        border-style: solid;
        border-color: transparent;
        border-width: 4em;
        position: fixed;
        perspective: 75em;
        //font-size: 14px;
        
        &[interact='off'] {
            .ov-interact { display: none;}
        }
        &[interact='on'] {
            .ov-interact { @extend .ov-solid}
        }
        
        #navbar {margin-top: -3em;}
        .row { display: block; }
        .row.keep { display: flex;}
        .ov {
            position: absolute;
            min-height: 5%;
            width: auto;
            padding: 0.3em 0;
        }
        .ov-solid {
            border-radius: 0px;
            border-top: 1px solid orange;
            background: repeating-linear-gradient(#4c251499, #4c251454 1px, #4c251499 3px, #4c2514aa 4px);
            box-shadow: 0 0 1em #ff880088 inset, 0 0 1em #ff880047;}
        .ov-top-line { left: 33%; right: 33%; top: -3%; transform: rotate3d(1, 0, 0, -35deg) scale(0.9); transform-origin: 50% 100%}
        .ov-nav { left: 33%; right: 33%; top: 8%; transform: rotate3d(1, 0, 0, -25deg) scale(0.9); transform-origin: 50% 100%}
        .ov-center { top: 30%; left: 33%; right: 33%; }
        .ov-center-long { padding: 1em; left: 33%; top: 15%; right: 33%; height: 80%; max-height: 80%; overflow: auto; }
        
        .ov-right-top { right: 0%; top: 25%; width: 33%; transform: rotate3d(0, 1, 0, -35deg); transform-origin: 100% 0%}
        .ov-right {right: 0%; top: 45%; width: 33%; transform: rotate3d(0, 1, 0, -35deg); transform-origin: 100% 0%}
        .ov-left-top { left: 0%; top: 25%; width: 33%; transform: rotate3d(0, 1, 0, 35deg);transform-origin: 0 100% }
        .ov-left {left: 0%; top: 45%; width: 33%; transform: rotate3d(0, 1, 0, 35deg); transform-origin: 0 100%}
    }
</style>