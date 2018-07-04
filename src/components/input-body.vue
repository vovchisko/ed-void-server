<template>
    <div class="ui">
        <input :value="search" @input="do_search()">
        <pre>SEARCH: {{search}}</pre>
        <pre>ID: {{id}}</pre>
        <pre>LIST: {{list}}</pre>
    </div>
</template>

<script>
    import NET from '../ctrl/network'

    export default {
        name: "input-body",
        props: {
            id: {type: String, default: ''},
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
                NET.search
            },
            select_body: function (body_id) {
                this.$emit('input', Math.floor(Math.random() * 1000))
            }

        }
    }
</script>

<style scoped>
    .ui { padding: 3px; margin: 3px; border: 1px solid #555}
</style>