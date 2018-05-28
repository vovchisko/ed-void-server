<template>
    <div id="auth">
        <form v-if="sign_==='in'">

            <h2>ed-void login</h2>

            <div v-bind:class="['msg',msg.type]">{{msg.text}}</div>

            <div class="ui">
                <input type="email" v-model="auth.email"/>
                <label>Email</label>
            </div>

            <div class="ui">
                <input type="password" v-model="auth.pass"/>
                <label>Password</label>
            </div>

            <div class="ui">
                <button type="button" v-on:click="signin()">Signin</button>
            </div>

            <div class="ui links">
                <button type="button" class="link" v-on:click="sign('up')">New Pilot</button>
                <button type="button" class="link" v-on:click="sign('reset')">reset password</button>
            </div>
        </form>

        <form v-if="sign_==='up'">
            <h2>create new cmdr</h2>
            <div v-bind:class="['msg',msg.type]">{{msg.text}}</div>
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

                <div v-bind:class="['msg',reset.type]">{{reset.text}}</div>

                <div class="ui">
                    <input type="password" v-model="reset.new_pass"/>
                    <label>Password</label>
                </div>

                <div class="ui">
                    <input type="password" v-model="reset.new_pass_c"/>
                    <label>Confirm password</label>
                </div>

                <div class="ui">
                    <button type="button" v-on:click="reset_pass()">use new password</button>
                </div>

            </div>

            <div v-if="!secret">
                <div v-bind:class="['msg',reset.type]">{{reset.text}}</div>

                <div class="ui" v-if="!reset.result">
                    <input type="email" v-model="auth.email"/>
                    <label>email</label>
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
    import Net from '../services/network';
    import Data from '../services/data';
    import Route from '../services/router';

    const WELCOME_IN = 'welcome back commander';
    const WELCOME_UP = 'welcome in the void commander';

    export default {
        name: "auth",
        data: () => {
            return {
                route: Route,
                sign_: 'in', msg: {type: '', text: WELCOME_IN},
                secret: '',
                reset: {result: 0, type: '', text: '', new_pass: '', new_pass_c: ''},
                auth: Data.auth,
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
                                Data.auth.api_key = result.api_key;
                                Data.c_mode = 'cfg';
                                Data.save();
                                Route.reset_route();
                            } else {
                                alert('invalid verification link');
                            }
                        })
                        .catch((err) => {
                            console.log('email validation failed', err);
                        });
                }
                if (Route.action === 'reset' && Route.params[0]) {
                    this.secret = Route.params[0];
                    return this.sign('reset');
                }

                if (this.auth.api_key) return this.connect();

                this.sign('in');
            },
            request_reset: function () {
                Net.api('passrst', {email: this.auth.email})
                    .then((result) => {
                        if (result) {
                            this.reset.result = result.result;
                            this.reset.text = result.text;
                            this.reset.type = result.type;
                        }else{
                            throw new Error('no result')
                        }
                    })
                    .catch((err) => {
                        this.reset.result = 0;
                        this.reset.text = 'operation failed. try again later.';
                        this.reset.type = 'error';
                        console.log('requert failed', err);
                    });
            },
            reset_pass: function () {
                if (this.reset.new_pass !== this.reset.new_pass_c) {
                    this.reset.text = 'passwords and confirmation not equal';
                    this.reset.type = 'error';
                    this.reset.result = 0;
                    return;
                }

                //todo: global preloader required!
                Net.api('passrst', {secret: this.secret, pass: this.reset.new_pass})
                    .then((result) => {
                        if (result.result) {
                            Data.auth.api_key = result.api_key;
                            Data.save();
                            Route.reset_route();
                        } else {
                            this.reset.text = result.text;
                            this.reset.type = result.type;
                        }
                    })
                    .catch((err) => {
                        alert('oh snap! something went wrong');
                        console.log('requert failed', err);
                    });
            },
            sign: function (to = 'in') {
                this.sign_ = to;
                this.msg.type = '';
                if (this.sign_ === 'reset') return this.msg.text = '';
                if (this.sign_ === 'up') return this.msg.text = WELCOME_UP;
                if (this.sign_ === 'in') return this.msg.text = WELCOME_IN;
            },
            signup: function () {
                if (this.auth.pass !== this.pass_c) {
                    this.msg.type = 'warn';
                    this.msg.text = 'password/confirm are not equal';
                    return;
                }
                //todo: global preloader required!
                Net.api('signup', this.auth)
                    .then((dat) => {
                        if (!dat.result) {
                            this.msg.type = dat.type;
                            this.msg.text = dat.text;
                            return;
                        }
                        this.signin();
                        this.sign = 'in';
                    })
                    .catch((e) => {
                        this.msg.type = 'error';
                        this.msg.text = 'undable to complete request. please try again later';
                    });
            },
            signin: function () {
                Net.api('signin', {email: this.auth.email, pass: this.auth.pass})
                    .then((dat) => {
                        if (!dat.result) {
                            this.msg.type = dat.type;
                            this.msg.text = dat.text;
                            return;
                        }
                        this.auth.api_key = dat.user.api_key;
                        this.auth.pass = '';
                        this.connect();
                    })
                    .catch((e) => {
                        this.msg.type = 'error';
                        this.msg.text = 'undable to complete request. please try again later';
                    });
            },
            connect: function () {
                this.auth.is_logged = true;
                Net.init(this.auth.api_key);
                Data.save();
            }
        }
    }

    Net.on('_close', (code, reason) => {
        if (reason === 'unauthorized') {
            Data.auth.api_key = '';
            Data.auth.is_logged = false;
            Data.save();
        }
    });

</script>

<style lang="scss">
    @import "../styles/vars";
    #auth {
        .all-actions { text-align: center; font-size: 0.9em;
            button { display: inline-block; margin: 0 5px;}
        }
        h2 { @include hcaps(); font-size: 2em; }
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
                button { display: inline-block; margin: 0 1em;  clear: none; width: auto}
            }
        }
    }
</style>