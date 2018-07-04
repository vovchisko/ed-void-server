<template>
    <div id="repo">
        <header>
            <div v-if="c_tab==='home'">
                <button type="button" class="link" v-on:click="go_create()"><i class="i-file-add"></i> create</button>
                <button type="button" class="link" v-if="repo.reports_count !== null" v-on:click="get_recent()"><i class="i-sync"></i> sync</button>
            </div>

            <div v-if="c_tab==='view'">
                <button v-if="c_tab!=='home'" class="link" v-on:click="go_home()" type="button"><i class="i-angle-left"></i> back</button>
                <button type="button" class="link" v-if="!repo.curr.locked" v-on:click="go_edit()"><i class="i-edit"></i> edit report</button>
                <span v-if="repo.curr.locked" class="rep-locked"><i class="i-bookmark"></i> protected</span>
            </div>

            <div v-if="c_tab==='edit'">
                <button v-if="c_tab!=='home'" class="link" v-on:click="go_home()" type="button"><i class="i-angle-left"></i> back</button>
            </div>

        </header>

        <div id="repo-edit" v-if="c_tab==='edit'" class="container-fluid">
            <h4 class="title edfx" v-if="repo.curr._id">
                <span class="date">{{repo.curr.submited | date}}</span>
                <span class="id">{{repo.curr._id}}</span>
                <span class="type">{{report_types[repo.curr.type]}}</span>
            </h4>
            <h4 class="title edfx" v-if="!repo.curr._id">NEW REPORT</h4>

            <div class="row">
                <div class="col-sm curr-entry">
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
                        <label>subject / title</label>
                    </div>

                    <div class="ui">
                        <textarea v-model="repo.curr.description" placeholder="optional description"></textarea>
                        <label>report description ({{repo.curr.description.length}} / 1000)</label>
                    </div>

                </div>

                <div class="col-sm curr-location">

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
                        <label>reported by</label>
                    </div>

                    <button type="button" v-if="!repo.curr._id" class="link" v-on:click="curr_location()"><i class="i-globe"></i> use current position and cmdr</button>

                </div>

            </div>

            <br>

            <div class="row">
                <div class="col-sm">
                    <h4 class="edfx">
                        screenshots
                    </h4>
                    <div class="ui">
                        <input type="text" v-model="repo.curr.screens.cockpit">
                        <label>cockpit screenshot link</label>
                    </div>

                    <div class="ui">
                        <input type="text" v-model="repo.curr.screens.sys_map">
                        <label>system map screenshot link</label>
                    </div>

                    <div class="tip-box">
                        <div class="icon"><i class="i-shield-check"></i></div>
                        <div>
                            <h5>private information</h5>
                            <small>This links is required for report validation.<br>Other CMDRs can't see it.</small>
                        </div>
                    </div>

                </div>

                <div class="col-sm">
                    <h4>
                        links
                        <button type="button" class="link"
                                v-on:click="repo.curr.links.push('')"
                                v-if="repo.curr.links.length < 5">
                            <i class="i-file-add"></i> add link
                        </button>
                    </h4>
                    <div class="ui" v-for="(k,i) in repo.curr.links">
                        <input type="text" v-model="repo.curr.links[i]">
                        <label>link #{{i+1}}</label>
                        <button type="button" class="link" v-on:click="repo.curr.links.splice(i,1)">remove <i class="i-cross"></i></button>
                    </div>
                </div>

            </div>

            <hr class="both">

            <div class="ui">
                <button type="button" v-on:click="curr_submit()">{{repo.curr._id ? 'save changes' : 'submit report'}}</button>
                <button type="button" v-on:click="curr_reset()">cancel</button>
            </div>

            <hr class="top">
        </div>

        <div id="repo-view" v-if="c_tab==='view'">

            <div class="row edfx">
                <div class="col-sm listed">

                    <h4 class="title">
                        <span class="date">{{repo.curr.submited | date}}</span>
                        <span class="id">{{repo.curr._id}}</span>
                        <span class="type">{{report_types[repo.curr.type]}}</span>
                    </h4>
                    <br>

                    <em v-if="repo.curr.sub_type"><b>classified as:</b><span>{{report_sub_types[repo.curr.type][repo.curr.sub_type]}}</span></em>
                    <em><b>subject</b><span>{{repo.curr.subject}}</span></em>
                    <em><b>cmdr</b><span>{{repo.curr.reporter}}</span></em>
                </div>
                <div class="col-sm">
                    <h4>Location</h4>

                    <em><b>system</b><span>{{repo.curr.system}} <small class="starpos"><u v-for="x in repo.curr.starpos">{{x/32}}</u></small></span></em>
                    <em v-if="repo.curr.body"><b>body</b><span>{{repo.curr.body.replace(repo.curr.system,'')}}</span></em>
                    <em v-if="repo.curr.lat"><b>LAT</b><span>{{repo.curr.lat | nn(4,4)}} <u>°</u></span></em>
                    <em v-if="repo.curr.lon"><b>LON</b><span>{{repo.curr.lon | nn(4,4)}} <u>°</u></span></em>

                </div>
            </div>
            <div class="row edfx">
                <div class="desc col-sm-6">
                    <h4>Description</h4>
                    <div class="user-text">{{repo.curr.description || '[ no details ]'}}</div>
                </div>

                <div class="desc col-sm-6 listed">
                    <h4 v-if="repo.curr.links.length">additional links</h4>

                    <div class=" repo-link" v-for="(link , i) in repo.curr.links" v-if="link">
                        <i class="i-link"></i> <a v-bind:href="link" target="_blank">{{link}}</a>
                    </div>

                    <br>

                    <h4>screenshots</h4>

                    <em><b>cockpit</b>
                        <span v-if="repo.curr.screens.cockpit"><a v-bind:href="repo.curr.screens.cockpit" target="_blank"><i class="i-link"></i> {{repo.curr.screens.cockpit}}</a></span>
                        <span v-if="!repo.curr.screens.cockpit"><i class="i-warning"></i> not specified</span>
                    </em>

                    <em><b>system</b>
                        <span v-if="repo.curr.screens.sys_map"><a v-bind:href="repo.curr.screens.sys_map" target="_blank"><i class="i-link"></i> {{repo.curr.screens.sys_map}}</a></span>
                        <span v-if="!repo.curr.screens.sys_map"><i class="i-warning"></i> not specified</span>
                    </em>

                </div>

            </div>
        </div>

        <div id="repo-reports" v-if="c_tab==='home'">

            <div class="alert info edfx" v-if="repo.reports_count === 0">
                <i class="i-ed-alert"></i>
                <div>No reports found</div>
                <small>there is no reports matching your request</small>
            </div>

            <ul class="search-results">
                <li class="repo-item edfx" v-for="r in repo.reports">

                    <div class="row">
                        <div class="col-sm listed">
                            <h4 class="title">
                                <span class="date">{{r.submited | date}}</span>
                                <span class="id">{{r._id}}</span>
                                <span class="type">{{report_types[r.type]}}</span>
                            </h4>
                            <div class="actions">
                                <button class="link" v-on:click="select_report(r)"><i class="i-file"></i> report details</button>
                                <span v-if="r.locked" class="rep-locked"><i class="i-bookmark"></i> protected</span>
                            </div>
                            <em v-if="r.sub_type"><b>classified as:</b><span>{{report_sub_types[r.type][r.sub_type]}}</span></em>
                            <em><b>subject</b><span>{{r.subject}}</span></em>
                            <em><b>cmdr</b><span>{{r.reporter}}</span></em>
                        </div>
                        <div class="col-sm">
                            <h4>Location</h4>

                            <em><b>system</b><span>{{r.system}}</span></em>
                            <em v-if="r.body"><b>body</b><span>{{r.body.replace(r.system,'')}}</span></em>
                            <em><b>&nbsp;</b><span><small class="starpos"><u v-for="x in r.starpos">{{x/32}}</u></small></span></em>
                            <em v-if="r.lat"><b>LAT</b><span>{{r.lat | nn(4,4)}} <u>°</u></span></em>
                            <em v-if="r.lon"><b>LON</b><span>{{r.lon | nn(4,4)}} <u>°</u></span></em>

                        </div>
                    </div>
                </li>
            </ul>
        </div>

    </div>
</template>

<script>
    import Vars from '../ctrl/vars';
    import Vue from 'vue';
    import extend from 'deep-extend';

    import {A} from '../components/alert';
    import NET from '../ctrl/network';
    import PILOT from '../ctrl/pilot';

    const _REPO_NULL = {};
    const REPO = {
        curr: {
            _id: null,

            //user can edit
            type: 'NA',
            sub_type: null,
            subject: '',
            description: '',
            links: [''],
            screens: {
                cockpit: '',
                sys_map: ''
            }, //required

            system: null,
            body: null,
            lat: null,
            lon: null,
            reporter: null,
            pub: false, //other peopl can find it
            locked: false, //report confirmed nad locked

            //user can't edit
            parent_id: null, //for a few reports in the same place
            starpos: [0, 0, 0],
            system_id: null,
            body_id: null,
            reported: null,
            updated: null,

        },
        reports_count: null,
        reports: [],
    };

    extend(_REPO_NULL, REPO);

    function reset_report() {
        extend(REPO.curr, _REPO_NULL.curr);
    }

    export default {
        name: "rep",
        data: () => {
            return {
                c_tab: 'home',
                tabs: ['home', 'view', 'edit'],
                repo: REPO,
                report_types: Vars.REPORT_TYPES,
                report_sub_types: Vars.REPORT_SUB_TYPES,
            }
        },
        methods: {
            go_home() {
                reset_report();
                this.c_tab = 'home';
                this.get_recent();
            },
            go_create() {
                reset_report();
                this.c_tab = 'edit';
            },
            go_edit() {
                this.c_tab = 'edit';
            },
            go_view() {
                this.c_tab = 'view';
            },
            get_recent: function () {
                A.lock('loading recent reports...');
                this.repo.reports.splice(0, this.repo.reports.length);
                setTimeout(() => {
                    NET.send('repo-search', {});
                }, 500);
            },
            curr_location: function () {
                if (this.repo.curr._id) return;
                this.repo.curr.system = PILOT.env.system.name;
                this.repo.curr.system_id = PILOT.env.system._id;
                if (PILOT.env.body) {
                    this.repo.curr.body = PILOT.env.body.name;
                    this.repo.curr.body_id = PILOT.env.body._id;
                    this.repo.curr.lat = PILOT.status.lat;
                    this.repo.curr.lon = PILOT.status.lon;
                }
                this.repo.curr.reporter = PILOT.cmdr.name;
                this.repo.curr.starpos[0] = PILOT.env.system.starpos[0];
                this.repo.curr.starpos[1] = PILOT.env.system.starpos[1];
                this.repo.curr.starpos[2] = PILOT.env.system.starpos[2];
            },
            curr_change_type: function () {
                if (!this.report_sub_types[this.repo.curr.type]) return (this.repo.curr.sub_type = null);
                for (let st in this.report_sub_types[this.repo.curr.type])
                    if (st.includes('-NA')) return (this.repo.curr.sub_type = st);
            },

            curr_submit: function () {
                setTimeout(() => {
                    NET.api('poirep', this.repo.curr)
                        .then((res) => {
                            if (res.report) {
                                Vue.set(this.repo, 'curr', res.report);
                                this.c_tab = 'view';
                            }
                        })
                        .catch((err) => {
                            A.error({text: 'operation failed', desc: err.message});
                        });
                }, 500);
            },
            curr_reset: function () {
                reset_report();
                this.c_tab = 'home'
            },
            select_report: function (r) {
                extend(this.repo.curr, r);
                this.c_tab = 'view'
            }
        }
    }

    NET.on('uni:repo-search', (reports) => {
        let list = REPO.reports;

        list.splice(0, list.length);
        for (let i = 0; i < reports.length; i++) {
            list.push(reports[i]);
        }
        REPO.reports_count = reports.length;
        A.release();
    });

</script>

<style lang="scss">
    @import "../styles/vars";
    #repo {
        header i.active { font-size: 1.4em}

        #repo-reports {
            .alert { font-size: 1.2em; margin-top: 20vh }
        }

        ul.search-results { display: block; margin: 0; padding: 0; }
        ul.search-results li {
            display: block; margin: 0; padding: 1em 0 2em 0;
            border-bottom: 1px solid $dark;
            border-top: 1px solid $dark;
            .actions {
                margin: 0.5em 0 0.9em 0; line-height: 1.5em;
                button { padding-right: 1em; color: darken($ui-act-fg, 25%); }
            }
        }

        h4 {
            //color: lighten($ui-text, 15%);
            button { margin-left: 1em; font-size: 0.8em; }
        }

        .title {
            @include hcaps();
            span {
                &.date { display: inline-block; white-space: nowrap; font-size: 0.7em; }
                &.id {
                    display: inline-block; white-space: nowrap;
                    font-size: 0.7em;
                    //font-family: 'Titillium Web', sans-serif;
                    text-transform: none;
                    color: darken($orange, 15%);
                    padding-left: 1em;
                    &:before {
                        content: 'ID: ';
                        text-transform: none;
                        // color: darken($cyan, 15%);
                    }
                }
                &.type { display: block; color: lighten($ui-text, 15%); }
            }

        }

        .repo-link {
            i {margin-right: 0.5em}
            a { padding: 0.3em; display: inline-block }
        }
        .user-text { white-space: pre-wrap; word-wrap: break-word;}
        .rep-locked { @include hcaps(); color: $purple}
    }

</style>