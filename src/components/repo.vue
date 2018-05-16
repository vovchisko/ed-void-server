<template>
    <div id="repo">
        <header>
            <button v-for="t in tabs" v-on:click="c_tab = t" v-bind:class="t === c_tab ? 'active':''">{{t}}</button>
        </header>

        <div id="repo-new" v-if="c_tab==='+report'">
            <div class="centered">
                <div class="alert warn" v-if="navi.body.name !== null && !navi.body.radius">
                    <i class="i-ed-alert"></i>
                    <div>No scan data in database</div>
                    <small>Scan body to identify radius and gravity correctly</small>
                </div>

                <h4>{{env.system ? env.system.name : 'UNDEFINED SYSTEM'}}</h4>
                <div class="starpos" v-if="env.system"><u v-for="x in env.system.starpos">{{x/32}};</u></div>

                <em><b>BODY</b> <span>{{navi.body.name || 'N/A'}}</span></em>
                <em><b>RADIUS</b> <span>{{navi.body.radius / 1000 || null | nn(3,3, 'N/A') }} <u>KM</u></span></em>
                <em><b>GRAVITY</b> <span>{{navi.body.gravity | nn(3,3, 'N/A')}} <u>G</u></span></em>
            </div>
        </div>

        <div id="repo-recent" v-if="c_tab==='recent'">
            recent reports
        </div>

        <div id="repo-search" v-if="c_tab==='search'">
            search for reports
        </div>
    </div>
</template>

<script>
    import Data from '../services/data';

    let curr = Data.repo.curr;

    export default {
        name: "rep",
        data: () => {
            return {
                c_tab: '+report',
                tabs: ['+report', 'recent'],
                curr: Data.repo.curr,
                navi: Data.navi,
                env: Data.env,
            }
        },
        methods: {}
    }

</script>

<style lang="scss">
    #repo {
        .starpos { text-align: center; }
    }
</style>