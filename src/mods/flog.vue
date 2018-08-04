<template>
    <div id="flog">
        <header class="edfx">
            FLIGHT LOG
        </header>
        <edata-here></edata-here>
        <div>
            <div class="alert info" v-if="!recent.length">
                <i class="i-ed-alert"></i>
                <h4>no recent activity</h4>
                <p>no recent activity was found in database</p>
            </div>
            <ev class="edfx" v-for="rec in recent" v-bind:rec="rec" v-bind:key="rec._id"></ev>
        </div>
    </div>
</template>

<script>
    import FLOG from '../ctrl/flog';
    import Ev from '../components/ev';
    import EdataHere from "../components/edata-here";

    export default {
        name: "flog",
        components: {EdataHere, Ev},
        data: () => {
            return {
                recent: FLOG.recent,
            }
        },
    }
</script>

<style lang="scss">
    @import "../styles/vars";
    #flog {
        .flight-log {
            .ev {
                padding: 1em 0;
                .head { margin: 0 -5px 0.8em -5px; padding: 0.8em 5px 0.4em 5px; background: darken($ui-bg, 2%); }
            }
            .main em { color: lighten($ui-text, 15%); font-size: 1.05em; line-height: 1.1em}
            .sub em { font-size: 0.8em; }
            
            .scan:last-child { display: none; }
            .scan:first-child { display: block !important; }
            .scan.empty { text-align: center; color: $orange; padding: 100px 0; }
        }
    }
</style>