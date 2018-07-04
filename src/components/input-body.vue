<template>
    <div class="ui">
        <input v-model="search" @input="do_search()">
        <label v-if="!!label">{{label}}</label>

    </div>
</template>

<script>
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
                list: [],
            }
        },
        mounted: function () { if (!this.search && this.id) this.search = this.id},
        methods: {
            do_search: function () {
                console.log('search time', this.search);
                if (Math.random() > 0.8) this.select_body('mundii@1:1:' + Math.floor(Math.random() * 1000));
                NET.api('findbody', {name: this.search});
            },
            select_body: function (body_id) {
                this.$emit('input', body_id);
                console.log('let`t say user selected new body');
            }

        }
    }
</script>

<style scoped>

</style>