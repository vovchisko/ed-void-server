<template>
    <div id="cmdr">
        <div class="row">
            <div class="col-sm">
                <h5>CMDR INFO</h5>
                <em><b>CMDR</b><span>{{cmdr.name}}</span></em>
                <em><b>SYSTEM</b><span>{{env.system ? env.name : 'n/a'}}</span></em>
                <em><b>&nbsp;</b><span class="false">
                    <span v-for="x in cmdr.starpos"> {{x/32}}; </span>
                </span></em>
                <em><b>LOC</b><span>{{env.body ? env.body.name : 'Deep Space'}}</span></em>
            </div>
            <div class="col-sm">
                <h5>ACCOUNT INFO</h5>
                <em><b>EMAIL</b><span>{{user.email}}</span></em>
                <em><b>API_KEY</b><span>{{user.api_key}}</span></em>

                <button v-on:click="signout()">signout</button>

            </div>
        </div>

        <h5>ED-VOID CLIENT INSTALLATION</h5>
        <div class="row">
            <div class="col-sm-6">
                <p class="help">
                    - Download Client <a href="download/ed-void-client.zip">ed-void.zip [ 8.16 Mb ]</a>
                    on your PC.<br>
                    - Run and follow the instructions
                </p>
                <p class="help">If you need help - visit our
                    <a href="https://discord.gg/s7qchpj" target="_blank">Discord Server</a></p>

            </div>
        </div>
    </div>
</template>

<script>
    import Data from '../services/data';
    import Net from '../services/network';


    export default {
        name: 'cmdr',
        mounted: function () { console.info('DATA:', this.cmdr, this.user)},
        data: () => { return {cmdr: Data.cmdr, user: Data.user, env: Data.env}},
        methods: {
            signout: function () {
                Net.disconnect();
                Data.auth.is_logged = false;
                Data.auth.wtoken = '';
                Data.save();
                Data.nullify();
            }
        }
    }


</script>

<style lang="scss">

</style>