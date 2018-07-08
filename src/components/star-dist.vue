<template>
    <span v-bind:class="['star-dist', err ? 'err' : '']">{{dist}}</span>
</template>

<script>
    import TOOLS from '../ctrl/tools'
    import PILOT from '../ctrl/pilot'

    export default {
        name: "starpos",
        props: {
            pos: {type: Array, default: () => { return PILOT.cmdr.starpos}},
            dest: {type: Array, default: () => { return [0, 0, 0]}},
        },
        data: () => {
            return {
                err: false,
                v1: [0, 0, 0],
                v2: [0, 0, 0],
                dist: 0,
            }
        },
        mounted: function () {
            this.recalc();
        },
        watch: {
            pos: function (n, o) {
                this.recalc();
            },
            dest: function (n, o) {
                this.recalc();
            }
        },
        methods: {
            recalc: function () {
                if (typeof this.pos !== 'object' || typeof this.dest !== 'object') {
                    this.dist = "DIST-ERR!";
                    this.err = true;
                    return;
                }
                this.err = false;
                this.v1 = this.pos.map(x => x);
                this.v2 = this.dest.map(x => x);
                this.dist = this.$options.filters.nn(TOOLS.distance(this.v1, this.v2) / 32, 0, 0) + ' ly';
            }
        }
    }
</script>

<style lang="scss">
    .star-dist { }
</style>