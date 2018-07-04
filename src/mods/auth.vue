<template>
    <div id="auth" v-if="!MODE.is_in && !MODE.is_ready">
        <form v-if="sign_==='in'">

            <h2>ed-void login</h2>

            <div class="ui">
                <input type="email" v-model="auth.email"/>
                <label>Email</label>
            </div>

            <div class="ui">
                <input type="password" v-model="auth.pass"/>
                <label>Password</label>
            </div>

            <div class="ui">
                <button type="button" v-on:click="signin()">Sign in</button>
            </div>

            <div class="ui links">
                <button type="button" class="link" v-on:click="sign('up')">New Pilot</button>
                <button type="button" class="link" v-on:click="sign('reset')">reset password</button>
            </div>
        </form>

        <form v-if="sign_==='up'">
            <h2>create new cmdr</h2>

            <div class="ui">
                <input type="email" v-model="auth.email"/>
                <label>Email</label>
            </div>
            <div class="ui">
                <input type="password" v-model="auth.pass"/>
                <label>Password</label>
            </div>
            <div class="ui">
                <input type="password" v-model="pass_c"/>
                <label>Confirm password</label>
            </div>
            <div class="ui">
                <button type="button" v-on:click="signup()">Register</button>
            </div>

            <div class="ui links">
                <button type="button" class="link" v-on:click="sign('in')">back to login</button>
            </div>
        </form>

        <form v-if="sign_ === 'reset'">

            <h2>reset password</h2>

            <div v-if="secret">

                <div class="ui">
                    <input type="password" v-model="reset.new_pass"/>
                    <label>new password</label>
                </div>

                <div class="ui">
                    <input type="password" v-model="reset.new_pass_c"/>
                    <label>confirm new password</label>
                </div>

                <div class="ui">
                    <button type="button" v-on:click="reset_pass()">use new password</button>
                </div>

            </div>

            <div v-if="!secret">
                <div class="ui" v-if="!reset.result">
                    <input type="email" v-model="auth.email"/>
                    <label>account email</label>
                </div>

                <div class="ui" v-if="!reset.result">
                    <button type="button" v-on:click="request_reset()">send me a link</button>
                </div>

                <div class="ui links">
                    <button type="button" class="link" v-on:click="sign('in')">back to login</button>
                </div>

            </div>
        </form>

    </div>
</template>

<script>
    import Net from '../ctrl/network';
    import Route from '../ctrl/router';
    import CFG from '../ctrl/cfg';
    import MODE from '../ctrl/mode';
    import {A} from '../components/alert';

    export default {
        name: "auth",
        data: () => {
            return {
                MODE: MODE,
                route: Route,
                auth: {email: '', pass: ''},
                sign_: 'in',
                secret: '',
                reset: {new_pass: '', new_pass_c: ''},
                pass_c: '',
            }
        },
        created: function () { this.init(); },
        methods: {
            init: function () {
                if (Route.action === 'verify' && Route.params[0]) {
                    this.secret = Route.params[0];
                    Net.api('everify', {secret: this.secret})
                        .then((result) => {
                            if (result.result) {
                                CFG.api_key = result.api_key;
                                CFG.c_mode = 'cfg';
                                CFG.save();
                                Route.reset_route();
                            } else {
                                throw result;
                            }
                        })
                        .catch((err) => {
                            A.error({
                                text: 'email validation failed',
                                desc: 'invalid validation link',
                            }, true);
                        });
                }
                if (Route.action === 'reset' && Route.params[0]) {
                    this.secret = Route.params[0];
                    return this.sign('reset');
                }

                if (MODE.is_in) return Net.init();

                this.sign('in');
            },
            request_reset: function () {

                Net.api('passrst', {email: this.auth.email})
                    .then((result) => {

                        if (result) {
                            A.add(result);
                        } else {
                            A.error({text: 'reset password request failed',});
                        }
                    })
                    .catch((e) => A.error({text: 'undable to complete request. please try again later'}));
            },
            reset_pass: function () {
                if (this.reset.new_pass !== this.reset.new_pass_c)
                    return A.error({text: 'password and confirmation are not equal',});

                Net.api('passrst', {secret: this.secret, pass: this.reset.new_pass})
                    .then((result) => {
                        if (result.result) {
                            CFG.api_key = result.api_key;
                            CFG.save();
                            Route.reset_route();
                        } else {
                            return A.error(result);
                        }
                    })
                    .catch((e) => A.error({text: 'undable to complete request. please try again later'}));

            },
            sign: function (to = 'in') {
                this.sign_ = to;
            },
            signup: function () {
                if (this.auth.pass !== this.pass_c)
                    return A.error({text: 'password/confirm are not equal'});

                Net.api('signup', this.auth)
                    .then((dat) => {
                        if (!dat.result) return A.add(dat);
                        this.signin();
                        this.sign = 'in';
                    })
                    .catch((e) => A.error({text: 'undable to complete request. please try again later'}));

            },
            signin: function () {
                Net.api('signin', {email: this.auth.email, pass: this.auth.pass})
                    .then((dat) => {
                        if (!dat.result) return A.add(dat);
                        CFG.api_key = dat.user.api_key;
                        this.auth.pass = '';
                        Net.init();
                    })
                    .catch((e) => A.error({text: 'undable to complete request. please try again later'}));
            },
        }
    }

    Net.on('_close', (code, reason) => {
        if (reason === 'unauthorized') {
            MODE.is_ready = false;
            MODE.is_in = false;
            CFG.api_key = '';
            CFG.save();
        }
    });

</script>

<style lang="scss">
    @import "../styles/vars";
    #auth {
        .all-actions { text-align: center; font-size: 0.9em;
            button { display: inline-block; margin: 0 5px;}
        }
        h2 { @include hcaps(); font-size: 2em; padding-bottom: 1.5em; }
        form {
            width: 18em;
            margin: 0 auto;
            padding: calc(50vh - 300px + 1em) 0 3em 0;
            border: $ui-bg;
            input, button {
                display: block; clear: both; width: 100%;
            }
            button { }
            .msg {
                text-transform: uppercase; margin: 10px 0 10px 0;
                &.error { color: $ui-err;}
            }
            .ui.links { text-align: center;
                button { display: inline-block; margin: 0 1em; clear: none; width: auto}
            }
        }
    }
</style>