<template>
    <component v-bind:is="component" v-bind:rec="rec_"></component>
</template>

<script>
    import EvScan from '../components/ev-scan';
    import EvFsdjump from '../components/ev-fsdjump';

    export default {
        name: "ev",
        components: {EvScan, EvFsdjump},
        props: {
            rec: {
                type: Object,
                required: true,
            }
        },
        data: function () {
            return {
                rec_: this.rec,
                component: 'ev-' + this.rec.event.toLowerCase()
            }
        },

    }
</script>

<style lang="scss">
    .ev {
        margin: 0.5em 0;
    }
</style>