<template>
    <div id="repo">
        <header>

            <div v-if="c_tab==='home'">
                <button type="button" class="link" v-on:click="go_create()"><i class="i-file-add"></i> create</button>
            </div>

            <div v-if="c_tab!=='home'">
                <button v-if="c_tab!=='home'" class="link" v-on:click="go_home()" type="button"><i class="i-chevron-left"></i> back</button>
            </div>

        </header>

        <div class="alert modal" v-bind:class="[state.alert.type, state.loading ? 'progress':'']" v-show="state.alert.show === true">
            <i class="i-ed-alert"></i>
            <div>{{state.alert.msg}}</div>
            <div class="ui" v-if="!state.loading">
                <button type="button" v-on:click="state.alert.show = false">roger that</button>
            </div>
        </div>

        <div id="repo-edit" v-if="c_tab==='edit'" class="container-fluid">

            <div class="row">
                <div class="col-sm curr-entry">

                    <h2 v-if="repo.curr._id">REP: {{repo.curr.type}}-<span class="id">{{repo.curr._id}}</span></h2>
                    <h2 v-if="!repo.curr._id">NEW REPORT</h2>

                    <div class="ui">
                        <select v-model="repo.curr.type" v-on:change="curr_change_type()">
                            <option v-for="(type, t) in report_types" v-bind:value="t">{{type}}</option>
                        </select>
                        <label>Type</label>
                    </div>

                    <div class="ui" v-if="report_sub_types[repo.curr.type]">
                        <select v-model="repo.curr.sub_type">
                            <option v-for="(sub_type, st) in report_sub_types[repo.curr.type]" v-bind:value="st">{{sub_type}}</option>
                        </select>
                        <label>sub-type / class</label>
                    </div>

                    <div class="ui">
                        <input type="text" v-model="repo.curr.subject" placeholder="report subject">
                        <label>subject / title</label><br>
                    </div>

                    <div class="ui">
                        <textarea v-model="repo.curr.description" placeholder="optional description"></textarea>
                        <label>report description ({{repo.curr.description.length}} / 255)</label>
                    </div>

                    <div class="alert warn" v-if="navi.body.name !== null && !navi.body.radius">
                        <i class="i-ed-alert"></i>
                        <div>No body data in database</div>
                        <small>Scan body to identify radius and gravity correctly</small>
                    </div>
                </div>

                <div class="col-sm curr-location">

                    <h2>
                        LOCATION DETAILS
                        <button type="button" v-on:click="curr_location()">Use Current</button>
                    </h2>

                    <div class="ui">
                        <input v-model="repo.curr.system" placeholder="Not Specified">
                        <label>system name</label>
                    </div>

                    <div class="ui" v-if="!['SF'].includes(repo.curr.type)">
                        <input v-model="repo.curr.body" placeholder="Not Specified">
                        <label>body name</label>
                    </div>

                    <div class="row" v-if="!['PF', 'SF'].includes(repo.curr.type)">
                        <div class="col-sm-6">
                            <div class="ui">
                                <input v-model="repo.curr.lat" placeholder="0.00000">
                                <label>latitude</label>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div class="ui">
                                <input v-model="repo.curr.lon" placeholder="0.00000">
                                <label>longitude</label>
                            </div>
                        </div>
                    </div>

                    <div class="ui">
                        <input type="text" v-model="repo.curr.reporter" placeholder="cmdr name">
                        <label>reported by</label><br>
                    </div>
                </div>

            </div>

            <div class="ui">
                <button type="button" v-on:click="curr_submit()">submit report</button>
                <button type="button" v-on:click="go_home()">cancel</button>
            </div>

        </div>

        <div id="repo-reports" v-if="c_tab==='home'">

            <div class="alert info" v-if="repo.reports_count === null">
                <i class="i-ed-alert"></i>
                <div>No reports to display</div>
                <small>load your recent reports or create new one</small>
                <div class="ui">
                    <button type="button" v-on:click="get_recent()" v-if=""><i class="i-sync"></i> recent</button>

                </div>
            </div>

            <div class="alert info" v-if="repo.reports_count === 0">
                <i class="i-ed-alert"></i>
                <div>No reports found</div>
                <small>there is no reports mathing your request</small>
            </div>

            <ul class="search-results">
                <li class="repo-item" v-for="r in repo.reports" v-on:click="select_report(r)">
                    <div class="row">
                        <div class="col-sm listed">
                            <h2>REP: {{r.submited | date}} <br>
                                <small>{{report_types[r.type]}}</small>
                            </h2>
                            <em v-if="r.sub_type"><b>classified as:</b><span>{{report_sub_types[r.type][r.sub_type]}}</span></em>
                            <em><b>subject</b><span>{{r.subject}}</span></em>
                            <em><b>cmdr</b><span>{{r.reporter}}</span></em>
                        </div>
                        <div class="col-sm">
                            <h3>Location</h3>

                            <em><b>system</b><span>{{r.system}} <small class="starpos"><u v-for="x in r.starpos">{{x/32}}</u></small></span></em>
                            <em><b>body</b><span>{{r.body}}</span></em>
                            <em v-if="r.lat"><b>LAT</b><span>{{r.lat | nn(4,4)}} <u>°</u></span></em>
                            <em v-if="r.lon"><b>LON</b><span>{{r.lon | nn(4,4)}} <u>°</u></span></em>

                            <div class="desc" v-if="r.description">
                                <h3>Description</h3>
                                <div>{{r.description}}</div>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>

    </div>
</template>

<script>

    import Data from '../services/data';
    import Vars from '../services/vars';
    import Net from '../services/network';
    import Vue from 'vue';
    import extend from 'deep-extend';

    // todo: pass saveing-error-success through this object
    let state = {
        loading: false,
        alert: {
            show: false,
            type: '',
            msg: 'nothing happened',
        }
    };


    export default {
        name: "rep",
        data: () => {
            return {
                c_tab: 'home',
                tabs: ['home', 'edit', 'view'],
                repo: Data.repo,
                navi: Data.navi,
                env: Data.env,
                cmdr: Data.cmdr,
                state: state,
                report_types: Vars.REPORT_TYPES,
                report_sub_types: Vars.REPORT_SUB_TYPES,
            }
        },
        methods: {
            go_home() {
                this.c_tab = 'home';
                this.c_tab = this.tabs[0];
                this.get_recent();
            },
            go_create() {
                this.c_tab = 'edit';
            },
            get_recent: function () {
                this.state.loading = true;
                this.state.alert.show = true;
                this.state.alert.msg = 'loading reports';
                this.state.alert.type = 'info';
                setTimeout(() => {
                    Net.send('repo-search', {});
                }, 750);

            },
            curr_location: function () {
                if (this.repo.curr._id) return;
                this.repo.curr.system = this.env.system.name;
                this.repo.curr.system_id = this.env.system._id;
                if (this.env.body) {
                    this.repo.curr.body = this.env.body.name;
                    this.repo.curr.body_id = this.env.body._id;
                    this.repo.curr.lat = this.navi.pos.lat;
                    this.repo.curr.lon = this.navi.pos.lon;
                }
                this.repo.curr.reporter = this.cmdr.name;
                this.repo.curr.starpos[0] = this.env.system.starpos[0];
                this.repo.curr.starpos[1] = this.env.system.starpos[1];
                this.repo.curr.starpos[2] = this.env.system.starpos[2];
            },
            curr_change_type: function () {
                if (!this.report_sub_types[this.repo.curr.type]) return (this.repo.curr.sub_type = null);
                for (let st in this.report_sub_types[this.repo.curr.type])
                    if (st.includes('-NA')) return (this.repo.curr.sub_type = st);
            },
            curr_submit: function () {
                this.state.loading = true;
                this.state.alert.show = true;
                this.state.alert.msg = 'reporting status';
                this.state.alert.type = 'info';
                setTimeout(() => {
                    Net.send('repo-submit', this.repo.curr);
                }, 750);
            },
            select_report: function (r) {
                Vue.set(this.repo, 'curr', r);
                this.repo.edit = false;
                console.log(r);
                this.c_tab = 'edit'
            }
        }
    }

    Net.on('uni:repo-current', (report) => {
        state.loading = false;
        extend(Data.repo.curr, report);
    });

    Net.on('uni:repo-submition', (dat) => {
        state.loading = false;
        state.alert.show = true;
        state.alert.msg = dat.msg;
        state.alert.type = dat.type || 'info';
        if (!dat.result) return;
        Net.send('repo-search', {});
        this.c_tab = 'view';
    });

    Net.on('uni:repo-search', (reports) => {
        let list = Data.repo.reports;

        list.splice(0, list.length);
        for (let i = 0; i < reports.length; i++) {
            list.push(reports[i]);
        }
        Data.repo.reports_count = reports.length;
        state.loading = false;
        state.alert.show = false;
    });

</script>

<style lang="scss">
    @import "../styles/vars";
    #repo {

        header i.active { font-size: 1.4rem}
        .id { font-family: 'Titillium Web', sans-serif}
        .curr-entry {}
        .curr-location h2 { margin: 1rem 0; }
        .curr-location h2 button { float: right; margin-top: -0.5rem; }

        #repo-reports {
            .alert { font-size: 1.2rem; margin-top: 20vh}
        }
        #repo-edit {
            h4 { margin-top: 5px; }
            small { display: block; margin-bottom: 0.4rem; }
        }

        ul.search-results { display: block; margin: 0; padding: 0; }
        ul.search-results li {
            display: block; margin: 0; padding: 1rem 0 2rem 0;
            border-bottom: 1px solid $dark;
            border-top: 1px solid $dark;
            h2 { color: darken($ui-act-fg, 25%); }
            h2 small { @include hcaps(); color: darken($ui-act-fg, 15%); }
            .starpos { color: darken($ui-text, 15%)}
        }

    }

</style>