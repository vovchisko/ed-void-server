<template>
    <div id="cfg">
        <header>
            void config
        </header>
        <div div class="row">
            <div class="col-sm">
                <h1>ui settings</h1>

                <div class="ui short">
                    <select v-model="cfg.font_size" @change="font_size_change()">
                        <option v-for="i in cfg.font_sizes_list" v-model="cfg.font_sizes_list[i]">{{i}}</option>
                    </select>
                    <label>font size</label>
                </div>

            </div>
            <div class="col-sm listed">
                <h1>account info</h1>
                <em><b>EMAIL</b><span>{{user.email}}</span></em>
                <em><b>API_KEY</b><span>{{user.api_key}}</span></em>

                <br>
                <h3>ED-VOID CLIENT INSTALLATION</h3>
                <p class="help">
                    - Download <a href="download/ed-void-journal.zip">Jouranl Client [8.6Mb]</a><br>
                    - Run and follow the instructions.<br>
                    - Come back to ED-VOID
                </p>
                <p>If you need help - visit our
                    <a href="https://discord.gg/s7qchpj" target="_blank">Discord Server</a>
                </p>
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
        mounted: function () { this.font_size_change(); },
        methods: {
            font_size_change: function () {
                document.body.style.fontSize = this.cfg.font_size;
                Data.save();
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