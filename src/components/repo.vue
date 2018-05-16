<template>
    <div id="repo">
        <header>
            <button v-for="t in tabs" v-on:click="c_tab = t" v-bind:class="t === c_tab ? 'active':''">{{t}}</button>
        </header>

        <div id="repo-new" v-if="c_tab==='+report'">
            <div class="row">
                <div class="col-6">
                    {{}}

                    <input type="text" v-model="current.system_name" placeholder="system">
                    {{current.system_id}}

                    <label><input type="text" v-model="current.body_name"></label>
                    <input type="text" v-model="current.body_id">
                    <input type="text" v-model="current.lon">
                    <input type="text" v-model="current.lat">
                    <input type="text" v-model="current.reporter">

                    <button type="button" v-on:click="use_current_location()">Use Current</button>
                </div>

                <div class="col-6">

                </div>
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
    import Net from '../services/network';

    export default {
        name: "rep",
        data: () => {
            return {
                c_tab: '+report',
                tabs: ['+report', 'recent', 'search'],
                current: Data.poi.current,
                recent: Data.poi.recent,
                search: Data.poi.search,
                env: Data.env,
                cmdr: Data.cmdr
            }
        },
        methods: {
            use_current_location: function () {
                let cpoi = this.current;

                cpoi.system_name = this.env.system.name;
                cpoi.system_id = this.env.system._id;
                cpoi.starpos = this.cmdr.starpos;

                if (this.env.body_id) {
                    cpoi.body_name = this.env.body.name;
                    cpoi.body_id = this.env.body._id;

                    cpoi.lat = this.cmdr.status.lat;
                    cpoi.lon = this.cmdr.status.lon;
                }
            }
        }
    }

</script>

<style>

</style>