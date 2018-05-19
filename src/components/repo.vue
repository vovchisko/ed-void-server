<template>
    <div id="repo">
        <header>
            <button v-for="t in tabs" v-on:click="c_tab = t" v-bind:class="t === c_tab ? 'active':''">{{t}}</button>
        </header>

        <div id="repo-new" v-if="c_tab==='+report'" class="container-fluid">

            <div class="alert modal" v-bind:class="[state.alert.type, state.loading ? 'progress':'']" v-show="state.alert.show === true">
                <i class="i-ed-alert"></i>
                <div>{{state.alert.msg}}</div>
                <div class="ui prime" v-if="!state.loading">
                    <button type="button" v-on:click="state.alert.show = false">roger that</button>
                </div>
            </div>

            <pre>

                - скрывать / показывать поля в зависимости от выбранного типа POI
                - валидировать обязательные поля для типа POI
                - оформить список репортов
                - отобразить иконкой залоченые списки
                - поиск по POI - мои / рядом / по типу
                - сортировка по удаленности
                - кнопка "назначить курс"
                -- добавить в пункт назначения body/system name
                -- отобразить сообщение "не та планета, летите к ..."
                -- отобразить сообщение "летите в систему ... "


            </pre>

            <h1 v-if="curr._id">REPORT: {{curr.type}}-<span>{{curr._id}}</span></h1>
            <h1 v-if="!curr._id">NEW REPORT</h1>

            <div class="row">
                <div class="col-sm">
                    <h3>LOCATION</h3>

                    <div class="ui">
                        <input v-model="curr.system" placeholder="Not Specified">
                        <label>system name</label>

                    </div>

                    <div class="ui">
                        <input v-model="curr.body" placeholder="Not Specified">
                        <label>body name</label>
                    </div>

                    <div class="row">
                        <div class="col-sm-6">
                            <div class="ui">
                                <input v-model="curr.lat" placeholder="0.00000">
                                <label>latitude</label>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div class="ui">
                                <input v-model="curr.lon" placeholder="0.00000">
                                <label>longitude</label>
                            </div>
                        </div>
                    </div>
                    <br>

                    <div class="ui">
                        <input type="text" v-model="curr.reporter" placeholder="cmdr name">
                        <label>reported by</label><br>
                    </div>

                    <div v-if="curr._id">
                        <em><b>REPORTED: </b><span>{{curr.submited}}</span></em>
                        <em><b>BY: </b><span>{{curr.reporter}}</span></em>
                        <em v-if="curr.updated !== curr.submited"><b>UPDATED: </b><span>{{curr.updated}}</span></em>
                    </div>

                    <div v-if="!curr._id">
                        <button type="button" v-on:click="set_current_location()">Set From Current</button>
                    </div>

                </div>
                <div class="col-sm">

                    <h3>REPORT ENTRY</h3>

                    <div class="ui">
                        <select v-model="curr.type">
                            <option v-for="(type, t) in report_types" v-bind:value="t">{{type}}</option>
                        </select>
                        <label>Type</label>
                    </div>

                    <div class="ui">
                        <input type="text" v-model="curr.subject" placeholder="report subject">
                        <label>subject</label><br>
                    </div>

                    <div class="ui">
                        <textarea v-model="curr.description" placeholder="optional description"></textarea>
                        <label>report</label>
                    </div>

                    <div class="alert warn" v-if="navi.body.name !== null && !navi.body.radius">
                        <i class="i-ed-alert"></i>
                        <div>No body data in database</div>
                        <small>Scan body to identify radius and gravity correctly</small>
                    </div>

                    <div class="ui">
                        <button type="button" v-on:click="submit()">submit report</button>
                        <button type="button" v-on:click="cancel()">cancel</button>
                    </div>
                </div>
            </div>
        </div>

        <div id="repo-recent" v-if="c_tab==='recent'">
            <button type="button" v-on:click="get_reports()">View Recent Reports</button>

            <div class="repo-item" v-for="r in recent" v-on:click="edit_report(r)">
                <h3>REPORT: {{r.type}}-{{r._id}}</h3>
                <em><b>type</b><span>{{report_types[r.type]}}</span></em>
                <em><b>subject</b><span>{{r.subject}}</span></em>
                <em><b>system</b><span>{{r.system}}</span></em>
                <em><b>body</b><span>{{r.body}}</span></em>
            </div>

            <pre>{{recent}}</pre>
        </div>

        <div id="repo-search" v-if="c_tab==='search'">
            search for reports
        </div>

    </div>
</template>

<script>
    import Data from '../services/data';
    import Net from '../services/network';
    import extend from 'deep-extend';


    let curr = {
        _id: null,

        //user can edit
        type: '',
        subject: '',
        description: '',
        links: [],
        pub: false, //other peopl can find it
        locked: false, //report confirmed nad locked

        //user can't edit
        parent_id: null, //for a few reports in the same place
        system_id: null,
        body_id: null,

        lat: 0,
        lon: 0,
        reporter: null

    };

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
                c_tab: '+report',
                tabs: ['+report', 'recent'],
                curr: Data.repo.curr,
                recent: Data.repo.recent,
                navi: Data.navi,
                env: Data.env,
                cmdr: Data.cmdr,
                report_types: Data.REPORT_TYPES,
                state: state,
            }
        },
        methods: {
            set_current_location: function () {
                if (this.curr._id) return;
                this.curr.system = this.env.system.name;
                this.curr.system_id = this.env.system._id;
                if (this.env.body) {
                    this.curr.body = this.env.body.name;
                    this.curr.body_id = this.env.body._id;
                    this.curr.lat = this.navi.pos.lat;
                    this.curr.lon = this.navi.pos.lon;
                }
                this.curr.reporter = this.cmdr.name;
                this.curr.starpos[0] = this.env.system.starpos[0];
                this.curr.starpos[1] = this.env.system.starpos[1];
                this.curr.starpos[2] = this.env.system.starpos[2];
            },
            cancel: function () { Data.nullify('repo'); },
            submit: function () {
                this.state.loading = true;
                this.state.alert.show = true;
                this.state.alert.msg = 'reporting status';
                this.state.alert.type = 'info';
                setTimeout(() => {
                    Net.send('repo-submit', this.curr);
                }, 1000);
            },
            get_reports: function () {
                Net.send('repo-search', {});
            },
            edit_report: function (r) {
                extend(this.curr, r);
                this.c_tab = this.tabs[0]
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

        //if (dat.result) { Data.nullify('repo');}
    });

    Net.on('uni:repo-search', (reports) => {
        let recents = Data.repo.recent;
        recents.splice(0, recents.length);
        for (let i = 0; i < reports.length; i++) {
            recents.push(reports[i])
        }
    });

</script>

<style lang="scss">
    #repo {
        h1 { font-family: 'Titillium Web', sans-serif}
    }
    #repo-new {
        h4 { margin-top: 5px; }
        small { display: block; margin-bottom: 0.4rem; }
    }
</style>