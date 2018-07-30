<template>
    <div id="vass">
        <header class="edfx">
            <button v-on:click="c_tab = t" v-for="t in tabs" v-bind:class="c_tab === t ? 'active' : ''">{{t}}</button>
        </header>

        <div v-if="c_tab==='flight log'" class="flight-log">
            <div class="alert info" v-if="!recent.length">
                <i class="i-ed-alert"></i>
                <div>no recent activity</div>
                <small>no recent activity was found in database</small>
            </div>

            <div class="row curr-sys-summ" v-if="env.system">
                <div class="col-sm">
                    <h3>
                        <small>current system:</small>
                        {{env.system.name}}
                    </h3>
                </div>
                <div class="col-sm">
                    <h3>
                        <small>scanned bodies:</small>
                        <span><u>{{exp.curr_system.scanned}}/{{env.system.ds_count}}</u>  {{exp.curr_system.total | nn()}} Cr </span>
                    </h3>
                </div>
            </div>

            <ev class="edfx" v-for="rec in recent" v-bind:rec="rec" v-bind:key="rec._id"></ev>
        </div>

        <div v-if="c_tab==='data'" class="exp-data">
            <div class="row summary">
                <div class="col-sm edfx">
                    <h2 class="main">
                        <span>estimated data value</span>
                        <b>{{exp.total | nn()}} <u>Cr</u></b>
                        <small>* discovery bonus not included</small>
                    </h2>
                </div>
                <div class="col-sm edfx">
                    <div class="counters justified">
                        <em><b>data collected in</b> <span>{{exp.sys_count}} <u>systems</u></span></em>
                        <em><b>stars</b> <span>{{exp.summ.s}}</span></em>
                        <em><b>planets</b> <span>{{exp.summ.p}}</span></em>
                        <em><b>clusters</b> <span>{{exp.summ.c}}</span></em>

                    </div>
                </div>
            </div>
            <div class="curr-system edfx edfx-delay-3" v-if="env.system">
                <div class="row curr-sys-summ">
                    <div class="col-sm">
                        <h3>
                            <small>current system:</small>
                            {{env.system.name}}
                        </h3>
                    </div>
                    <div class="col-sm">
                        <h3>
                            <small>scanned bodies:</small>
                            <span><u>{{exp.curr_system.scanned}}/{{env.system.ds_count}}</u>  {{exp.curr_system.total | nn()}} Cr </span>
                        </h3>
                    </div>
                </div>
                <br>
                <div v-if="exp.curr_system">
                    <em v-for="(b,k) in exp.curr_system.bodies"><b>{{env.system.name}} {{k}}</b><span>{{b.v | nn()}} <u>Cr</u></span></em>
                </div>

            </div>
            <div class="systems">
                <h4 class="edfx edfx-delay-3" v-if="exp.total">
                    <button class="link" v-on:click="refresh_exp()"><i class="i-sync"></i> load full data log</button>
                </h4>
                <div class="sys edfx" v-for="s in exp.systems">
                    <div class="row ">
                        <div class="col-sm">
                            <h5>{{s.name}}<br><span>{{s.val | nn()}} Cr</span></h5>
                        </div>
                        <div class="col-sm justified">
                            <em v-for="(b,k) in s.bodies"><b>{{s.name}} {{k}}</b><span>{{b.v | nn()}} <u>Cr</u></span></em>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue';
    import NET from '../ctrl/net';
    import Data from '../ctrl/data';
    import PILOT from '../ctrl/pilot';
    import Ev from '../components/ev';

    export default {
        name: "vass",
        components: {Ev},
        data: () => {
            return {
                c_tab: 'flight log',
                tabs: ['flight log', 'data'],
                recent: Data.vass.recent,
                exp: Data.vass.exp,
                env: PILOT.env
            }
        },
        methods: {
            refresh_exp: function () {
                this.exp.systems.splice(0, this.exp.systems.length);
                NET.send('exp-refresh');
            },
        }
    }

    function push_rec(rec) {
        let recent = Data.vass.recent;
        for (let i = 0; i < recent.length; i++) {
            if (rec._id === recent[i]._id) {
                return;
            }
        }

        recent.push(rec);
        recent.sort((a, b) => {
            //new on top
            if (a.timestamp > b.timestamp) { return -1; }
            if (a.timestamp < b.timestamp) { return 1; }
            return 0;
        });

        // cut
        if (recent.length > 64)
            recent.splice(-1, 1);
    }

    function push_exp_summ(dat) {
        let exp = Data.vass.exp;

        exp.total = dat.total;
        exp.sys_count = dat.sys_count;
        Vue.set(exp.curr_system, 'bodies', {});
        exp.curr_system.total = 0;
        exp.curr_system.scanned = 0;

        if (dat.curr_system) {
            exp.curr_system.bodies = dat.curr_system.bodies;
            for (let i in exp.curr_system.bodies) {
                exp.curr_system.scanned++;
                exp.curr_system.total += exp.curr_system.bodies[i].v;
            }
        }

        for (let i in dat.summ)
            exp.summ[i] = dat.summ[i];

        if (dat.systems) {
            exp.systems.splice(0, exp.systems.length);
            for (let s in dat.systems) {
                let s_data = {
                    name: s,
                    val: 0,
                    upd: dat.systems[s].upd,
                    bodies: dat.systems[s].bodies
                };
                for (let i in s_data.bodies) s_data.val += s_data.bodies[i].v;
                exp.systems.push(s_data);
            }

            exp.systems.sort((a, b) => {
                if (a.upd > b.upd) { return -1; }
                if (a.upd < b.upd) { return 1; }
                return 0
            });
        }
    }

    NET.on('uni:exp-data', (data) => { push_exp_summ(data)});
    NET.on('pipe:Scan', (rec) => push_rec(rec));
    NET.on('pipe:FSDJump', (rec) => push_rec(rec));
</script>

<style lang="scss">
    @import "../styles/vars";
    #vass {
        .curr-sys-summ {
            h3 {
                padding: 0.5em 0 0 0;
                font-size: 1.3em; color: lighten($ui-text, 20%);
                small { display: block; color: darken($ui-text, 15%); }
                span { color: $ui-text;
                    u { color: $cyan; padding-right: 0.4em }
                }
            }
        }

        .flight-log {

            .ev {
                padding: 1em 0;
                .head { margin: 0 -5px 0.8em -5px; padding: 0.8em 5px 0.4em 5px; background: darken($ui-bg, 2%); }
            }
            .main em { color: lighten($ui-text, 15%); font-size: 1.05em; line-height: 1.1em}
            .sub em { font-size: 0.8em; }

            .scan:last-child { display: none; }
            .scan:first-child { display: block !important; }
            .scan.empty { text-align: center; color: $orange; padding: 100px 0; }
        }

        .exp-data {
            .summary {
                text-align: right;
                padding-top: 1em;
                h2 {
                    margin: 0; padding: 0; font-size: 2em;
                    span { display: block; font-size: 0.5em; letter-spacing: 0.05em; color: darken($ui-text, 20%); }
                    b { color: $orange; padding: .4em 0 0.1em 0; display: block; }
                    small { color: darken($ui-text, 30%); font-size: 0.4em;}
                }
                .counters em {
                    &:first-child { padding-bottom: 0.1em; margin-bottom: 0.1em;}
                    &:first-child, &:first-child b { font-weight: bold; }
                    font-size: 1.1em; line-height: 1.2em;
                    b { @include hcaps(); }
                    span {@include hcaps(); color: lighten($ui-text, 15%);}
                }
                .col-md { background: $dark; padding-bottom: 1.5em; padding-top: 1.5em}
            }
        }

        .curr-system {
            padding-top: 1em;
            font-size: 1.08em;
            em b { text-transform: uppercase; color: $ui-text;}
            em span { padding-left: 10px; color: lighten($ui-text, 20%); font-weight: bold;
                u { color: darken($ui-text, 10%); }
            }
        }

        .systems {
            padding-top: 2em;
            .sys {
                margin: 0.6em 0 0 0; padding: 0.6em 0 0 0; border-top: 2px solid $dark;
                h5 { padding: 0; margin: 0;
                    span { color: darken($ui-text, 20%) }
                }
                em { line-height: 1.1em;
                    b { text-transform: uppercase; color: darken($ui-text, 10%); width: 70%; }
                    span {width: 30%;
                        u { color: darken($ui-text, 15%); }
                    }
                }
            }
        }

    }
</style>