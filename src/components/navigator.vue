<template>
    <div class="navigator">
        <div class="compass edfx" v-if="NAV.status.head !== null">
            <div class="ruler" v-bind:style="NAV.style_ruler">
                <b class="head">{{NAV.status.head}}</b>
            </div>
            <div class="dest" v-if="NAV.dest.head" v-bind:style="NAV.style_dest">
                <b class="head" v-bind:class="NAV.dest_align">{{NAV.dest.head}}</b>
            </div>
        </div>

        <div class="container-fluid ">
            <div class="row">
                <div class="col-sm loc-curr">
                    <h5>CURR. POSITION</h5>
                    <em v-if="NAV.env.system"><b>SYSTEM</b><span>{{NAV.env.system.name}}</span></em>
                    <em v-if="NAV.env.body"><b>BODY</b><span>{{NAV.env.body.name}}</span></em>
                    <em v-if="NAV.env.station"><b>ST</b><span>{{NAV.env.station.name}}</span></em>
                    <em v-if="!NAV.env.station && !NAV.env.body"><b>&nbsp;</b><span>deep space</span></em>
                    <em v-if="NAV.status.alt"><b>LAT</b><span>{{NAV.status.lat}} <u>°</u></span></em>
                    <em v-if="NAV.status.alt"><b>LON</b><span>{{NAV.status.lon}} <u>°</u></span></em>
                    <em v-if="NAV.status.alt"><b>ALT</b><span>{{NAV.status.alt}} <u>M</u></span></em>
                </div>
                <div class="col-sm loc-dest">
                    <h5>DESTINATION</h5>
                    <em v-if="NAV.dest.sys_id"><b>SYS</b><span>{{NAV.dest.sys_id}}</span></em>
                    <em v-if="NAV.dest.st_id"><b>ST</b><span>{{NAV.dest.st_id}}</span></em>
                    <em v-if="NAV.dest.body_id"><b>BODY</b><span>{{NAV.dest.body_id}}</span></em>
                    <em v-if="NAV.dest.head"><b>HEAD</b><span>{{NAV.dest.head | nn(0,0)}} <u>°</u></span></em>
                    <em v-if="NAV.dest.dist"><b>DIST</b><span>{{NAV.dest.dist | nn(3,3)}} <u>KM</u></span></em>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
    import PILOT from '../ctrl/pilot'
    import NET from '../ctrl/network'

    const NAV = {
        dest: PILOT.dest,
        status: PILOT.status,
        env: PILOT.env,
        style_ruler: {'background-position-x': 0},
        style_dest: {'background-position-x': 0},
    };

    export default {
        name: "navigator",
        data: () => {return {NAV: NAV}}
    }

    NET.on('uni:status', () => update_head());
    NET.on('uni:dest', () => update_head());

    function update_head() {
        let rw = window.innerWidth;
        let offset = (rw / 2) - NAV.status.head * 4;
        NAV.style_ruler['background-position-x'] = offset + 'px';
        if (NAV.dest.enabled) {
            if (isNaN(NAV.dest.head)) {
                NAV.style_dest['background-position-x'] = '0px';
                NAV.dest_align = 'err';
            } else {
                NAV.style_dest['background-position-x'] = (rw / 2) - ((NAV.status.head - NAV.dest.head) * 4) + 'px';
                let alg = Math.abs(NAV.dest.head - NAV.status.head);
                if (alg <= 3) NAV.dest_align = 'alg0';
                if (alg > 3) NAV.dest_align = 'alg1';
                if (alg > 10) NAV.dest_align = 'alg2';
            }
        }
    }
</script>

<style lang="scss">
    @import "../styles/vars";
    .navigator {
        .compass {overflow: hidden; height: 145px;margin: 0 -5px 10px -5px;
            .ruler { image-rendering: pixelated;
                background: transparent url('../../public/assets/nav-ruler.gif') 0 0; width: 100%; height: 30px;margin: 40px 0 33px 0;position: relative;transition: all linear 1000ms;}
            .ruler .head {width: 50px;font-size: 14px;display: block;text-align: center;border: 1px solid #ff8800;color: #ff8800;position: absolute;left: 50%;margin: -30px 0 0 -25px;}
            .ruler .head:after { content: "";width: 0;height: 0;border-left: 5px solid transparent;border-right: 5px solid transparent;border-top: 5px solid #ff8800;display: block;position: absolute;left: 50%;margin: 5px 0 0 -5px;}
            .dest {
                image-rendering: pixelated;
                background: transparent url('../../public/assets/nav-ruler-dest.gif') 0 0; width: 100%;height: 7px;position: relative;transition: all linear 1000ms;

                .head {transition: transform linear 0.5s; width: 60px;font-size: 15px;display: block;text-align: center;border: 1px solid #555;color: #555;position: absolute;left: 50%;margin: 10px 0 0 -30px;}
                .head:after {content: "";width: 0;height: 0;border-left: 7px solid transparent;border-right: 7px solid transparent;border-bottom: 7px solid #555;display: block;position: absolute;left: 50%;margin: 3px 0 0 -6.5px;top: -14px;}
                .head:before {content: "vector";color: #676767;display: block;position: absolute;left: 50%;margin: 5px 0 0 -100px;top: -42px;width: 200px;text-align: center;text-transform: uppercase;font-size: 13px;}
                .head.alg0 {border-color: #0098f9;color: #0098f9;}
                .head.alg0:after {border-bottom-color: #0098f9;top: -14px;}
                .head.alg0:before {content: '[ ok ]'; color: #0098f9; }
                .head.alg1 {border-color: #FF8800;color: #FF8800;}
                .head.alg1:after {border-bottom-color: #FF8800;top: -14px;}
                .head.alg1:before {content: 'missaligment'; color: #FF8800; }
                .head.alg2 {border-color: $red;color: $red;}
                .head.alg2:after {border-bottom-color: $red; top: -14px;}
                .head.alg2:before {content: 'wrong course vector!'; color: $red; }
                .head.err { animation: glitched_text 2.5s infinite; color: $red; border-color: $red; }
                .head.err:after { border-bottom-color: $red; }
                .head.err:before { content: 'destination data invalid'; color: $red }
            }
        }

        .loc-curr, .loc-dest {
            margin-top: 3em;
            h4 { margin-bottom: 0; }
            em { }
            em > b { width: 30%}
            em > span { width: 70%; text-align: left }
        }
        small { color: darken($ui-text, 25%);}
    }
</style>