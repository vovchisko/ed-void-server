<template>
    <div class="ui input-search" v-bind:class="list.length || focused ?'z-overall':''">
        <input v-model="search" @input="do_search()"
               v-bind:placeholder="station_name"
               v-on:blur="focused=false; reset_field()"
               v-on:focus="focused=true; reset_field(); $event.target.select()"
               v-on:keydown="keydown($event)">
        <label v-if="!!e_label">
            {{e_label}}
            <span class="inline-msg" v-if="focused && searching">Search...</span>
        </label>
        <button v-if="e_id" class="link b-remove" v-on:click="select_station(null)"><i class="i-cross"></i> clear</button>
        <div class="list edfx" v-if="list.length">
            <button class="link" v-for="b in list" v-on:click="select_station(b._id)">
                <i class="i-globe"></i> {{b.name}} <span>{{b.starpos}}</span>
            </button>
            <button v-if="list.length" class="link b-cancel" v-on:click="cleanup(); reset_field()"><i class="i-chevron-up"></i> cancel</button>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue'
    import NET from '../ctrl/network'
    import TOOLS from '../ctrl/tools';

    export default {
        name: "input-station",
        props: {
            id: {default: ''},
            label: {default: ''},
        },
        data: () => {
            return {
                searching: false,
                search: '',
                station_name: '',
                list: [],
                focused: false,
                //props
                e_id: null,
                e_label: null,
            }
        },
        mounted: function () {
            this.e_label = this.label;
            this.select_station(this.id, true);
        },
        watch: {
            id: function (n, o) {if (n !== this.e_id) this.select_station(n, true); },
            label: function (n, o) { if (n !== o) this.e_label = n;}
        },
        methods: {
            reset_field: function () {
                this.station_name = this.e_id ? TOOLS.name_from_id(this.e_id) : 'station not selected';
                this.search = this.e_id ? this.station_name : '';
            },
            do_search: function () {
                if (this.search.length < 2) return this.cleanup(false);
                this.searching = true;
                NET.api('s-stations', {search: this.search}, false)
                    .then((result) => {
                        Vue.set(this, 'list', result.stations);
                        this.searching = false;
                    })
                    .catch((err) => {
                        this.searching = false;
                        console.log(err);
                    });
            },
            select_station: function (station_id = null, external = false) {
                this.e_id = station_id;
                if (!external) this.cleanup();
                this.reset_field();
                if (!external) this.$emit('update:id', this.e_id);
            },
            cleanup: function (and_query = true) {
                this.list.splice(0, this.list.length);
                this.searching = false;
                if (and_query) this.search = '';
            },
            keydown: function (ev) {
                if (ev.key === 'Escape') {
                    ev.srcElement.blur();
                    this.cleanup();
                }
            }
        }
    }
</script>

<style lang="scss">

</style>