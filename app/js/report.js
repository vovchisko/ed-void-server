const Report = new Vue({
    el: '#report',
    data: {
        current: {}, //current info ready to get reported
        list: {}, // list of reports
        filter: {} // request for get filters
    },
    methods: {
        load: function (id) {
            //get report
        },
        report: function (current) {
            // create report from "current"
        },
    }
});
