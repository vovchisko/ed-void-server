<template>
    <div id="cfg">
        <header>
            void config
        </header>
        <div div class="row">
            <div class="col-sm">
                <select v-model="cfg.font_size" @change="font_size_change()">
                    <option>12px</option>
                    <option>13px</option>
                    <option>14px</option>
                    <option>15px</option>
                    <option>16px</option>
                </select>
            </div>
            <div class="col-sm listed">
                <h1>account info</h1>
                <em><b>EMAIL</b><span>{{user.email}}</span></em>
                <em><b>API_KEY</b><span>{{user.api_key}}</span></em>
            </div>
        </div>
    </div>
</template>

<script>
    import Data from '../services/data';
    import Net from '../services/network';

    export default {
        name: 'cfg',
        data: () => { return {cfg: Data.cfg, user: Data.user}},
        methods: {
            font_size_change: function () {
                document.body.style.fontSize = this.cfg.font_size;
            }
        }
    }
    Net.on('uni:user', (user) => {
        Data.user.email = user.email;
        Data.user.api_key = user.api_key;
    });

</script>

<style lang="scss">
    @import '../styles/vars';
    #cfg {
        //anything specific?
    }
</style>