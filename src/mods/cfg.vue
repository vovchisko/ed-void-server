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
                    <select v-model="cfg.ui_font_size" @change="cgf_apply()">
                        <option v-for="i in cfg._font_size_vars" v-model="cfg._font_size_vars[i]">{{i}}</option>
                    </select>
                    <label>font size</label>
                </div>

                <div class="ui short">
                    <select v-model="cfg.ui_fx_level" @change="cgf_apply()">
                        <option v-for="i in cfg._fx_level_vars" v-model="cfg._fx_level_vars[i]">{{i}}</option>
                    </select>
                    <label>ui effects</label>
                </div>

                <small>This options applied only for this device.</small>


                <br>
                <br>
                <br>
                <h3>ED-VOID CLIENT INSTALLATION</h3>
                <p class="help edfx">
                    - Download <a href="download/ed-void-client.zip">ED-VOID Client [8.17Mb]</a><br>
                    - Run and follow the instructions.<br>
                    - Come back to ED-VOID
                </p>
                <p class="help edfx">
                    <a href="https://discord.gg/s7qchpj" target="_blank" class="ext-link">
                        <img src="/landing/discord-logo.svg" class="img-icon">
                        Discord Support Channel
                    </a>
                </p>

                <p class="help edfx">
                    <a href="/" target="_blank" class="ext-link">
                        <img src="/favicon/favicon-96x96.png" class="img-icon" style="border-radius: 20%">
                        Go to Home Page
                    </a>
                </p>

            </div>

            <div class="col-sm ">
                <h2>account details</h2>
                <div class="tip-box email edfx">
                    <div class="icon">
                        <i class="i-shield-check valid" v-if="user.valid"></i>
                        <i class="i-shield-alert not-valid" v-if="!user.valid"></i>
                    </div>
                    <div>
                        <h5>
                            {{user.email}}
                            <button type="button" class="link" v-if="!user.valid && re_everify_result.result===0" v-on:click="re_everify()">request new link</button>
                        </h5>
                        <p v-if="user.valid">Email Verified</p>
                        <p v-if="!re_everify_result.text && !user.valid">We send you email with a link. Check your mail box.</p>
                        <p v-if="re_everify_result.text">
                            {{re_everify_result.text}}
                        </p>

                    </div>
                </div>

                <div class="tip-box api-key edfx">
                    <div class="icon">
                        <i class="i-barcode"></i>
                    </div>
                    <div>
                        <h5>
                            API-KEY &nbsp;
                            <button type="button" class="link" v-on:click="apikey_reset()"><i class="i-cross"></i> reset</button>
                        </h5>
                        <p>{{user.api_key}}</p>
                    </div>
                </div>

                <div class="tip-box pass edfx">
                    <div class="icon">
                        <i class="i-key"></i>
                    </div>
                    <div>
                        <h5>password &nbsp;
                            <button type="button" class="link" v-if="!pass_ch.toggle" v-on:click="pass_ch.toggle = true; pass_ch.result.text = ''"><i class="i-chevron-down"></i> change</button>
                            <button type="button" class="link" v-if="pass_ch.toggle" v-on:click="pass_ch.toggle = false; pass_ch.result.text = ''"><i class="i-chevron-up"></i> cancel</button>
                        </h5>
                        <p v-if="!pass_ch.toggle && !pass_ch.result.text">*************</p>
                        <p v-if="pass_ch.toggle || pass_ch.result.text" v-bind:class="['msg',pass_ch.result.type]">{{pass_ch.result.text}}</p>

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
                </div>


            </div>
        </div>
    </div>
</template>

<script>
    import Data from '../services/data';
    import Net from '../services/network';
    import Vue from 'vue';

    export default {
        name: 'cfg',
        data: () => {
            return {
                cfg: Data.cfg,
                user: Data.user,
                re_everify_result: {result: 0, type: '', text: ''},
                pass_ch: {toggle: false, c: '', n: '', nc: '', result: {result: 0, text: '', type: ''}}
            }
        },
        mounted: function () { this.cgf_apply(); },
        methods: {
            change_pass() {
                Net.api('passch', {curr_pass: this.pass_ch.c, new_pass: this.pass_ch.n})
                    .then((res) => {
                        this.pass_ch.result.type = res.type;
                        this.pass_ch.result.text = res.text;
                        this.pass_ch.result.result = res.result;
                        if (res.result) {
                            this.pass_ch.toggle = false;
                        }
                    })
                    .catch((e) => {
                        console.log('res: ', e);
                    });
            },
            apikey_reset: function () {
                if (!confirm(`This operation will disconnect all your devices and ED-VOID client and ask to re-login.\nAre you sure that you want to reset API-KEY?`)) return;
                Net.api('apirst', {})
                    .then((result) => {
                        if (result.result) {
                            location.reload();
                        } else {
                            alert("Unable to reset api-key\n" + result.text);
                        }
                    })
                    .catch((err) => {
                        console.log('email validation failed', err);
                    });
            },
            re_everify: function () {
                Net.api('everify', {email: this.user.email})
                    .then((result) => {
                        if (result.result) {
                            this.re_everify_result.result = result.result;
                            this.re_everify_result.text = result.text;
                            this.re_everify_result.type = result.type;
                            Data.save();
                        } else {
                            alert(result.type + ': ' + result.text);
                        }
                    })
                    .catch((err) => {
                        console.log('email validation failed', err);
                    });
            },
            signout: function () {
                Net.disconnect();
                Data.auth.is_logged = false;
                Data.auth.api_key = '';
                Data.save();
                Data.nullify('auth');
            },
            cgf_apply: function () {
                Data.apply_ui_cfg();
                Data.save();
            },

        }
    }
    Net.on('uni:user', (user) => {
        Data.user.email = user.email;
        Data.user.api_key = user.api_key;
        Data.user.valid = user.valid;
        Data.user.dev = user.dev;

        if (user.dev) {
            // user in dev mode
            Vue.set(Data.modes.modes, 'dev', 'dev');
        }
    });


</script>

<style lang="scss">
    @import '../styles/vars';
    #cfg {

        .tip-box {
            margin: 2em 0;
            h5 > button.link { display: inline; line-height: inherit; vertical-align: inherit; float: right; margin-right: 1em; }
            &.email {
                .valid { color: lighten($green, 0%); }
                .not-valid { color: darken($red, 15%); }
            }
            &.api-key {
                .icon { color: $purple; }
            }
            &.pass {
                .icon { color: $orange}
                .msg { padding-top: 0.5em; text-transform: uppercase;
                    &.error { color: $ui-err;}
                    &.info { color: $green;}
                }
            }
        }
        .help a { white-space: nowrap; color: lighten($ui-text, 15%); font-size: 0.9em; text-transform: uppercase}
        .help a:hover { white-space: nowrap; color: #fff; @include semiglitch-text(); text-decoration: none;}
        .help a:active { white-space: nowrap; color: #fff; @include glitch-text()}
        .img-icon { max-height: 2em; max-width: 2em; display: inline-block}
        button.logout { float: right; margin: 0 }
    }
</style>