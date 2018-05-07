<template>
    <div id="dev">
        <pre>{{data}}</pre>
    </div>
</template>

<script>
    import Data from '../services/data'

    export default {
        name: "dev",
        data: () => {return {data: Data} }
    }
</script>

<style lang="scss">
    pre { font-size: 0.7rem; line-height: 0.7rem}
</style>