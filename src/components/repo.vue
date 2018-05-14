<template>
    <div id="repo">
        <header>
            <button v-for="t in tabs" v-on:click="c_tab = t" v-bind:class="t === c_tab ? 'active':''">{{t}}</button>
        </header>

        <div id="repo-new" v-if="c_tab==='+report'">
            <div class="row">

                <div class="col-6">
                    <em><b>SYS</b>
                        <span>
                            {{current.system_name}}
                            <small><span v-for="x in current.starpos">{{x / 32}}; </span></small>
                        </span>
                    </em>

                    <em><b>BODY</b><span>{{current.body_name}}</span></em>
                    <em><b>BODY</b><span>{{current.body_name}}</span></em>

                </div>

                <div class="col-6">

                    !!! if report already exists here - mark new one as child-report

                </div>

            </div>


        </div>

        <div id="repo-new" v-if="c_tab==='recent'">
            recent reports
        </div>

        <div id="repo-new" v-if="c_tab==='search'">
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
                env: Data.env
            }
        }
    }

    Net.on('uni:c_body', (body) => {
        Data.poi.current.body_name = body.name;
        Data.poi.current.body_id = body.id;
    });
    Net.on('uni:c_system', (system) => {
        Data.poi.current.system_name = system.name;
        Data.poi.current.system_id = system.id;
    });
    Net.on('uni:coords', (coords) => {
        console.log(coords);
    });

</script>

<style>

</style>