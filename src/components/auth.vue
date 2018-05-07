<template>
    <div id="auth">
        <form v-if="sign_==='in'">

            <h2>ed-void login</h2>

            <div v-bind:class="['msg',msg.type]">{{msg.text}}</div>

            <input type="email" v-model="auth.email"/>
            <label>Email</label>

            <input type="password" v-model="auth.pass"/>
            <label>Password</label>

            <button type="button" v-on:click="signin()">Signin</button>
            <button type="button" v-on:click="sign('up')">Register Pilot</button>

        </form>

        <form v-if="sign_==='up'">

            <h2>create new cmdr</h2>

            <div v-bind:class="['msg',msg.type]">{{msg.text}}</div>

            <input type="email" v-model="auth.email"/>
            <label>Email</label>

            <input type="password" v-model="auth.pass"/>
            <label>Password</label>

            <input type="password" v-model="pass_c"/>
            <label>Confirm password</label>

            <button type="button" v-on:click="signup()">Register</button>
            <button type="button" v-on:click="sign('in')">Cancel</button>

        </form>
    </div>
</template>

<script>
    import Net from '../services/network';
    import Data from '../services/data';

    const WELCOME_IN = 'welcome back commander';
    const WELCOME_UP = 'welcome in the void commander';

    export default {
        name: "auth",
        data: () => { return {auth: Data.auth, pass_c: '', sign_: 'in', msg: {type: '', text: WELCOME_IN}}},
        created: function () {
            console.log(this.auth.wtoken);
            if (this.auth.wtoken) this.connect()
        },
        methods: {
            sign: function (to = 'in') {
                this.sign_ = to;
                this.msg.type = '';
                if (this.sign_ === 'up') return this.msg.text = WELCOME_UP;
                if (this.sign_ === 'in') return this.msg.text = WELCOME_IN;

            },
            signup: function () {
                if (this.auth.pass !== this.pass_c) {
                    this.msg.type = 'warn';
                    this.msg.text = 'password/confirm are not equal';
                    return;
                }
                Net.api('signup', this.auth)
                    .then((dat) => {
                        if (!dat.result) {
                            this.msg.type = dat.type;
                            this.msg.text = dat.text;
                            return;
                        }
                        this.signin();
                        this.sign = 'in';
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
                        this.auth.wtoken = dat.user.wtoken;
                        this.auth.pass = '';
                        this.connect();
                    });
            },
            connect: function () {
                this.auth.is_logged = true;
                Net.init(this.auth.wtoken);
                Data.save();
            }

        }
    }
</script>

<style lang="scss">

</style>