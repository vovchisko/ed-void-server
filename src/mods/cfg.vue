<template>
    <div id="cfg">
        <header>
            void config
            <button class="logout link" v-on:click="signout()">logout <i class="i-chevron-right"></i></button>
        </header>
        <div class="row">
            <div class="col-sm">
                <h2>ui settings </h2>
                <small>This options applied only for this device.</small>

                <div class="ui short">
                    <select v-model="CFG.ui_font_size" @change="cgf_apply()">
                        <option v-for="i in variant_font_size" v-model="variant_font_size[i]">{{i}}</option>
                    </select>
                    <label>font size</label>
                </div>

                <div class="ui short">
                    <select v-model="CFG.ui_fx_level" @change="cgf_apply()">
                        <option v-for="i in variant_fx_level" v-model="variant_fx_level[i]">{{i}}</option>
                    </select>
                    <label>ui effects</label>
                </div>

                <br>
                <br>
                <h3>ED-VOID CLIENT INSTALLATION</h3>
                <p class="help edfx">
                    - Download <a href="/download/ed-void-client.zip">ED-VOID Client [8.17Mb]</a><br>
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
                <h2 v-if="data.vass.exp.total">modules settings</h2>
                <div v-if="data.vass.exp.total" class="tip-box" style="margin: 0;">
                    <div class="icon"><i class="i-warning"></i></div>
                    <div>
                        <h5>Warning!</h5>
                        <small>This action reset counters and summary log for SCAN module. Use it if your module work incorrectly.</small>
                        <br>
                        <button v-on:click="reset_exp()"><i class="i-cross"></i> reset exploration stats</button>

                    </div>
                </div>
                <br>
                <br>
                <h2>account details</h2>
                <div class="tip-box email edfx">
                    <div class="icon">
                        <i class="i-shield-check valid" v-if="CFG.valid"></i>
                        <i class="i-shield-alert not-valid" v-if="!CFG.valid"></i>
                    </div>
                    <div>
                        <h5>
                            {{CFG.email}}
                            <button type="button" class="link" v-if="!CFG.valid && re_everify_result.result===0" v-on:click="re_everify()">request new link</button>
                        </h5>
                        <p v-if="CFG.valid">Email Verified</p>
                        <p v-if="!re_everify_result.text && !CFG.valid">We send you email with a link. Check your mail box.</p>
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
                        <p>{{CFG.api_key}}</p>
                    </div>
                </div>

                <div class="tip-box pass edfx">
                    <div class="icon">
                        <i class="i-key"></i>
                    </div>
                    <div>
                        <h5>password &nbsp;
                            <button type="button" class="link" v-if="!pass_ch.toggle" v-on:click="pass_ch.toggle = true;"><i class="i-chevron-down"></i> change</button>
                            <button type="button" class="link" v-if="pass_ch.toggle" v-on:click="pass_ch.toggle = false;"><i class="i-chevron-up"></i> cancel</button>
                        </h5>
                        <p v-if="!pass_ch.toggle">*************</p>

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
    import Data from '../ctrl/data';
    import NET from '../ctrl/net';
    import CFG from '../ctrl/cfg';
    import MODE from '../ctrl/mode';
    import {A} from '../components/alert';

    export default {
        name: 'cfg',
        data: () => {
            return {
                variant_font_size: new Array(17).fill(0).map((x, i) => {return i * 10 + 40 + '%'}),
                variant_fx_level: ['full', 'medium', 'low', 'disabled'],
                data: Data,
                CFG: CFG,
                re_everify_result: {result: 0, type: '', text: ''},
                pass_ch: {toggle: false, c: '', n: '', nc: ''}
            }
        },
        mounted: function () { this.cgf_apply(); },
        methods: {
            change_pass() {
                if (this.pass_ch.n !== this.pass_ch.nc) return A.warn({text: 'password/confirm are not equal'});
                NET.api('passch', {curr_pass: this.pass_ch.c, new_pass: this.pass_ch.n})
                    .then((res) => {
                        if (res.result) {
                            this.pass_ch.toggle = false;
                            A.info({
                                text: 'password chnaged',
                                desc: 'you can use new password next time'
                            });
                        } else {
                            A.error(res);
                        }
                    })
                    .catch((e) => {
                        console.log('res: ', e);
                    });
            },
            apikey_reset: function () {
                A.warn({
                    text: 'are you sure that you want to reset API-KEY?',
                    desc: 'This operation will disconnect all your devices from ED-VOID and ask to re-login.',
                    acts: {
                        'yes, reset api-key': () => {
                            NET.api('apirst', {})
                                .then((result) => {
                                    if (result.result) {
                                        A.info({text: "api-key changed successfully", desc: 'you need to re-login now an all your devices'});
                                    } else {
                                        A.error({text: "Unable to reset api-key", desc: result.text});
                                    }
                                })
                                .catch((err) => {
                                    A.error({text: "operation failed", desc: err.code});
                                });
                        }, cancel: null
                    }
                });
            },
            re_everify: function () {
                NET.api('everify', {email: this.CFG.email}, 'sending verification email...')
                    .then((result) => {
                        A.add(result);
                    })
                    .catch((err) => {
                        A.error({text: 'email validation failed', desc: err.code});
                    });
            },
            signout: function () {
                NET.disconnect();
                CFG.api_key = '';
                CFG.save();
                MODE.is_in = false;
                MODE.is_ready = false;
            },
            cgf_apply: function () {
                CFG.apply_ui_cfg();
                CFG.save();
            },
            reset_exp: function () {
                A.warn({
                    text: 'Reset exploration data summary',
                    desc: 'Do you really want to reset your exploration report counters and summary value?',
                    acts: {
                        'yes, reset my counters': () => {
                            NET.send('exp-reset');
                            A.info({text: 'exploration data report clear', desc: 'you summary exploration value is clear now'});
                        }, cancel: null
                    }
                });

            }

        }
    }

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