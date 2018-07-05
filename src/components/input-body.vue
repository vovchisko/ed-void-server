<template>
    <div class="ui input-body">
        <input v-model="search" @input="do_search()"
               v-bind:placeholder="val || 'not selected'"
               v-on:blur="focused=false"
               v-on:focus="focused=true"
               v-on:keydown="keydown($event)"
        >
        <label v-if="!!label">{{label}}</label>
        <button v-if="focused" class="link b-cancel" v-on:click="cleanup()"><i class="i-cross"></i> cancel</button>
        <button v-if="val && !focused" class="link b-remove" v-on:click="select_body(null)"><i class="i-cross"></i> remove</button>
        <div class="bodies-list edfs">
            <div v-for="b in list">
                <button class="link" v-on:click="select_body(b._id)"><i class="i-globe"></i> {{b.name}} <span>{{b.starpos}}</span></button>
            </div>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue'
    import NET from '../ctrl/network'

    export default {
        name: "input-body",
        props: {
            id: {default: ''},
            label: {default: ''},
        },
        data: () => {
            return {
                search: '',
                val: null,
                list: [],
                focused: false
            }
        },
        mounted: function () { this.val = this.id},
        methods: {
            do_search: function () {
                NET.api('findbody', {search: this.search}, false)
                    .then((result) => {
                        Vue.set(this, 'list', result.bodies);
                    })
                    .catch((err) => { console.log(err)});
            },
            select_body: function (body_id = null) {
                this.val = body_id;
                this.$emit('input', body_id);
                this.cleanup();

            },
            cleanup: function () {
                this.list.splice(0, this.list.length);
                this.search = '';
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
    @import '../styles/vars';
    .ui.input-body {
        & .b-remove { visibility: hidden; }
        &:hover .b-remove { visibility: visible}
        input {@include hcaps();}
        input::placeholder { color: $ui-text; @include hcaps();}
        input:focus::placeholder { color: darken($ui-text, 25%); }
        .bodies-list button span {opacity: 0.4; }
    }
</style>