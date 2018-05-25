<template>
    <div id="vass">
        <header>VOID ADV. SURFACE SCANNER</header>

        <div class="scan" v-for="s in recent" v-if="s.ScanType === 'Detailed'">
            <h4>
                <b>{{s.BodyName}}</b>
                <div>
                    <span class="arrival">ARR: {{s.DistanceFromArrivalLS | nn(0)}} ls</span>
                    <span class="star" v-show="s.StarType">[ STAR ]</span>
                    <span class="planet" v-show="s.PlanetClass && !s.Landable">[ BODY ]</span>
                    <span class="landable" v-show="s.PlanetClass && s.Landable">[ BODY / LANDABLE ]</span>
                    <span class="value" v-if="s.EstimatedValue">Value: {{s.EstimatedValue | nn(0)}} Cr</span>
                </div>
            </h4>
            <div class="container-fluid">
                <div v-show="s.StarType" class="row">
                    <div class="col-sm">
                        <div class="main">
                            <em><b>Class</b><span>{{s.StarType}}</span></em>
                            <em><b>Luminosity</b><span>{{s.Luminosity}}</span></em>
                            <em><b>Solar Masses</b><span>{{s.StellarMass | nn(4)}}</span></em>
                            <em><b>Solar Radius</b><span>{{s.Radius / 696000000 | nn(4)}}</span></em>
                            <em><b>Age</b><span>{{s.Age_MY | nn(4)}} <u>MILLION YEARS</u></span></em>
                            <em><b>Temperature</b><span>{{s.SurfaceTemperature | nn(1) }} <u>K</u></span></em>
                            <em><b>Rot.Period</b><span>{{s.RotationPeriod / 60 / 60 / 24 | nn(2)}} <u>DAYS</u></span></em>
                        </div>
                    </div>
                    <div class="col-sm">
                        <div class="sub ring" v-if="s.Rings" v-for="ring in s.Rings">
                            <h5>{{ring.Name}}</h5>
                            <em><b>Class</b><span>{{ring.RingClass}}</span></em>
                            <em><b>Mass</b><span>{{ring.MassMT | nn(0)}} <u>MT</u></span></em>
                            <em><b>Inner Radius</b><span>{{ring.InnerRad / 1000 | nn(0)}} <u>KM</u></span></em>
                            <em><b>Outer Radius</b><span>{{ring.OuterRad / 1000 | nn(0)}} <u>KM</u></span></em>
                        </div>
                    </div>
                </div>
                <div v-if="s.PlanetClass" class="row">
                    <div class="col-sm">
                        <div class="main">
                            <em><b>Planet Class</b><span>{{s.PlanetClass}}</span></em>
                            <em><b>Terraform State</b><span v-bind:class="s.TerraformState?'':'false'">{{s.TerraformState | isval}}</span></em>
                            <em><b>Tidal Lock</b><span v-bind:class="s.TidalLock?'':'false'">{{s.TidalLock | yn}}</span></em>
                            <em><b>Volcanism</b><span v-bind:class="s.Volcanism?'':'false'">{{s.Volcanism | isval}}</span></em>
                            <em><b>Earth Masses</b><span>{{s.MassEM | nn(4)}}</span></em>
                            <em><b>Radius</b><span>{{s.Radius / 1000 | nn(0)}} <u>KM</u></span></em>
                            <em><b>Gravity</b><span>{{s.SurfaceGravity / 9.80665 | nn(4)}} <u>G</u></span></em>
                            <em><b>Temperature</b><span>{{s.SurfaceTemperature | nn(0)}} <u>K</u></span></em>
                        </div>
                    </div>
                    <div class="col-sm">
                        <div class="sub composion" v-if="s.Composition">
                            <h5>Body Composition</h5>
                            <em v-for="(com ,val) in s.Composition"><b>{{val}}</b><span>{{com * 100 | nn(2)}} <u>%</u></span></em>
                        </div>

                        <div class="sub atmosphere" v-if="s.Atmosphere">
                            <h5>Atmosphere</h5>
                            <em><b>Surf. Pressure</b><span>{{s.SurfacePressure / 101325 | nn(3)}} <u>ATM</u></span></em>
                            <em><b>Atmosphere</b><span>{{s.Atmosphere || 'n/a'}}</span></em>
                            <em><b>Type</b><span>{{s.AtmosphereType}}</span></em>
                            <b>Atmosphere Composition</b>
                            <em v-for="acomp in s.AtmosphereComposition"><b>{{acomp.Name}}</b><span>{{acomp.Percent | nn(2,2)}} <u>%</u></span></em>
                        </div>

                        <div class="sub materials" v-if="s.Materials">
                            <h5>Materials</h5>
                            <em v-for="material in s.Materials">
                                <b>{{material.Name}}</b><span>{{material.Percent | nn(2,2)}} <u>%</u></span>
                            </em>
                        </div>

                        <div class="sub orbit">
                            <h5>Orbit</h5>
                            <em><b>Semi Major Axis</b><span>{{s.SemiMajorAxis / 149597870700 | nn(4)}} <u>AU</u></span></em>
                            <em><b>Orbital Period</b><span>{{s.OrbitalPeriod / 60 / 60 / 24 | nn(2)}} <u>DAYS</u></span></em>
                            <em><b>Rotation Period</b><span>{{s.RotationPeriod / 60 / 60 / 24 | nn(2)}} <u>DAYS</u></span></em>
                            <em><b>Orbital Eccentricity</b><span>{{s.Eccentricity}}</span></em>
                            <em><b>Orbital Inclination</b><span>{{s.OrbitalInclination | nn(2,2)}} <u>°</u></span></em>
                            <em><b>Arg Of Periapsis</b><span>{{s.Periapsis | nn(2,2)}} <u>°</u></span></em>
                            <em><b>Axial Tilt</b><span>{{s.AxialTilt  * 180 / Math.PI | nn(2,2)}} <u>°</u></span></em>
                        </div>

                        <div class="sub ring" v-if="s.Rings" v-for="ring in s.Rings">
                            <h5>Ring: {{ring.Name}}</h5>
                            <em><b>Class</b><span>{{ring.RingClass}}</span></em>
                            <em><b>Mass</b><span>{{ring.MassMT | nn(0)}} <u>MT</u></span></em>
                            <em><b>Inner Radius</b><span>{{ring.InnerRad / 1000 | nn(0)}} <u>KM</u></span></em>
                            <em><b>Outer Radius</b><span>{{ring.OuterRad / 1000 | nn(0)}} <u>KM</u></span></em>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="scan empty">No recent scans yet.</div>
    </div>
</template>

<script>

    import Net from '../services/network';
    import Data from '../services/data';


    export default {
        name: "vass",
        data: () => {return {recent: Data.vass.recent, c_system: Data.vass.c_system}}
    }

    Net.on('pipe:Scan', (rec) => {
        for (let i = 0; i < Data.vass.recent.length; i++) {
            if (rec.BodyName === Data.vass.recent[i].BodyName) {
                Data.vass.recent[i] = rec;
                return;
            }
        }

        //sort by timestamp
        Data.vass.recent.push(rec);
        Data.vass.recent.sort((a, b) => {
            //new on top
            if (a.timestamp > b.timestamp) { return -1; }
            if (a.timestamp < b.timestamp) { return 1; }
            return 0;
        });

        // cut
        if (Data.vass.recent.length > 50)
            Data.vass.recent.splice(-1, 1);
    });
</script>

<style lang="scss">
    @import "../styles/vars";
    #vass {
        h4 {
            text-transform: uppercase;font-size: 1.1em;margin: 10px 0 5px 0; padding: 5px; text-align: left; background: #100f0f;
            b { font-size: 1em; }
            div { text-align: right; font-size: 0.8em;}
            span { display: inline-block; margin-left: 1em }
            span.arrival {color: #d1d2a3; text-align: right;}
            span.star {color: $purple}
            span.planet {color: $green;}
            span.landable {color: $blue;}
            span.value {color: $orange;}
        }

        h5 { font-weight: normal; color: darken($ui-text, 15%)}

        .main em { color: lighten($ui-text, 15%); font-size: 1.05em; line-height: 1.1em}
        .sub em { font-size: 0.8em; }

        .scan:last-child { display: none; }
        .scan:first-child { display: block !important; }
        .scan.empty { text-align: center; color: $orange; padding: 100px 0; }

    }
</style>