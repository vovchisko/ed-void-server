<template>
    <div id="dev">
        <header>
            <button v-for="m in dev_mods"
                    v-on:click="c_mod = m"
                    v-bind:class="m === c_mod ? 'active':''">{{m}}
            </button>
        </header>

        <pre v-if="c_mod === 'data'">{{data}}</pre>
    </div>
</template>

<script>
    import Data from '../services/data'

    export default {
        name: "dev",
        data: () => {return {c_mod: 'data', dev_mods: ['data', 'pipe', 'uni'], data: Data} }
    }
</script>

<style lang="scss">
    #dev {
        header {
            button { margin-right: 5px;}
        }
        pre { font-size: 0.7rem; line-height: 0.7rem}

    }
</style>