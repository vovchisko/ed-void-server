<template>
    <div id="cfg">
        <header>
            void config
            <button class="logout link" v-on:click="signout()">logout <i class="i-chevron-right"></i></button>
        </header>
        <div class="row">
            <div class="col-sm">
                <h2>ui settings </h2>

                <div class="ui short">
                    <select v-model="cfg.font_size" @change="font_size_change()">
                        <option v-for="i in cfg.font_sizes_list" v-model="cfg.font_sizes_list[i]">{{i}}</option>
                    </select>
                    <label>font size</label>
                </div>

                <h2>account passwrd
                    <button type="button" class="link float-right" v-if="!pass_ch.toggle" v-on:click="pass_ch.toggle = true"><i class="i-chevron-down"></i> change</button>
                    <button type="button" class="link float-right" v-if="pass_ch.toggle" v-on:click="pass_ch.toggle = false"><i class="i-chevron-up"></i> cancel</button>
                </h2>
                <div v-if="pass_ch.toggle">
                    <div class="ui">
                        <input type="password" v-model="pass_ch.c">
                        <label>current password</label>
                    </div>

                    <div class="ui">
                        <input type="password" v-model="pass_ch.n">
                        <label>new password</label>
                    </div>
                    <div class="ui">
                        <input type="password" v-model="pass_ch.nc">
                        <label>confirm new password</label>
                    </div>
                    <button type="button" v-on:click="change_pass()">change password</button>
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
        data: () => {
            return {
                cfg: Data.cfg,
                user: Data.user,
                pass_ch: {toggle: false, c: '', n: '', nc: '',}
            }
        },
        mounted: function () { this.font_size_change(); },
        methods: {
            change_pass() {
                Net.api('passch', {curr_pass: this.pass_ch.c, new_pass: this.pass_ch.n})
                    .then((res) => {
                        console.log('res: ', res);
                    })
                    .catch((e) => {
                        console.log('res: ', e);
                    });
            },
            signout: function () {
                Net.disconnect();
                Data.auth.is_logged = false;
                Data.auth.api_key = '';
                Data.save();
                Data.nullify('auth');
            },
            font_size_change: function () {
                document.body.style.fontSize = this.cfg.font_size;
                Data.save();
            },

        }
    }
    Net.on('uni:user', (user) => {
        Data.user.email = user.email;
        Data.user.api_key = user.api_key;
        Data.user.valid = user.valid;
    });

</script>

<style lang="scss">
    @import '../styles/vars';
    #cfg {
        button.logout { float: right; margin: 0 }
    }
</style>