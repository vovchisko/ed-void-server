<template>
    <div id="vass">
        <header class="edfx">
            <button v-on:click="c_tab = t" v-for="t in tabs" v-bind:class="c_tab === t ? 'active' : ''">{{t}}</button>
        </header>

        <div class="alert info" v-if="!recent.length">
            <i class="i-ed-alert"></i>
            <div>no recent activity</div>
            <small>no recent activity was found in database</small>
        </div>
        <div v-if="c_tab==='flight log'">
            <ev class="edfx" v-for="rec in recent" v-bind:rec="rec" v-bind:key="rec._id"></ev>
        </div>
        <div v-if="c_tab==='data'">
            <pre>c_system: {{env.system}}</pre>
        </div>
    </div>
</template>

<script>

    import Net from '../services/network';
    import Data from '../services/data';
    import Ev from '../components/ev';

    export default {
        name: "vass",

        components: {Ev},
        data: () => {
            return {
                c_tab: 'flight log',
                tabs: ['flight log', 'data'],
                recent: Data.vass.recent,
                env: Data.env
            }
        }
    }

    function push_rec(rec) {
        for (let i = 0; i < Data.vass.recent.length; i++) {
            if (rec._id === Data.vass.recent[i]._id) {
                return;
            }
        }

        //sort by timestamp
        Data.vass.recent.push(rec);
        Data.vass.recent.sort((a, b) => {
            //new on top
            if (a.timestamp > b.timestamp) { return -1; }
            if (a.timestamp < b.timestamp) { return 1; }
            return 0;
        });

        // cut
        if (Data.vass.recent.length > 99)
            Data.vass.recent.splice(-1, 1);
    }

    Net.on('pipe:Scan', (rec) => push_rec(rec));
    Net.on('pipe:FSDJump', (rec) => push_rec(rec));
</script>

<style lang="scss">
    @import "../styles/vars";
    #vass {
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
</style>