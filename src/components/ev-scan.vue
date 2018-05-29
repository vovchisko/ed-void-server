<template>
    <div class="ev scan">
        <h3>{{s.BodyName}}</h3>
        <div>
            <span class="arrival">ARR: {{s.DistanceFromArrivalLS | nn(0)}} ls</span>
            <span class="star" v-show="s.StarType">[ STAR ]</span>
            <span class="planet" v-show="s.PlanetClass && !s.Landable">[ BODY ]</span>
            <span class="landable" v-show="s.PlanetClass && s.Landable">[ BODY / LANDABLE ]</span>
            <span class="value" v-if="s.EstimatedValue">Value: {{s.EstimatedValue | nn(0)}} Cr</span>
        </div>
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
                    <div class="sub" v-if="s.Composition">
                        <h5>Body Composition</h5>
                        <em v-for="(com ,val) in s.Composition"><b>{{val}}</b><span>{{com * 100 | nn(2)}} <u>%</u></span></em>
                    </div>

                    <div class="sub" v-if="s.Atmosphere">
                        <h5>Atmosphere</h5>
                        <em><b>Surf. Pressure</b><span>{{s.SurfacePressure / 101325 | nn(3)}} <u>ATM</u></span></em>
                        <em><b>Atmosphere</b><span>{{s.Atmosphere || 'n/a'}}</span></em>
                        <em><b>Type</b><span>{{s.AtmosphereType}}</span></em>
                    </div>

                    <h5 v-if="s.AtmosphereComposition">Atmosphere Composition</h5>
                    <em v-for="acomp in s.AtmosphereComposition"><b>{{acomp.Name}}</b><span>{{acomp.Percent | nn(2,2)}} <u>%</u></span></em>


                    <div class="sub materials" v-if="s.Materials">
                        <h5>Materials</h5>
                        <em v-for="material in s.Materials">
                            <b>{{material.Name}}</b><span>{{material.Percent | nn(2,2)}} <u>%</u></span>
                        </em>
                    </div>

                    <div class="sub">
                        <h5>Orbit</h5>
                        <em><b>Semi Major Axis</b><span>{{s.SemiMajorAxis / 149597870700 | nn(4)}} <u>AU</u></span></em>
                        <em><b>Orbital Period</b><span>{{s.OrbitalPeriod / 60 / 60 / 24 | nn(2)}} <u>DAYS</u></span></em>
                        <em><b>Rotation Period</b><span>{{s.RotationPeriod / 60 / 60 / 24 | nn(2)}} <u>DAYS</u></span></em>
                        <em><b>Orbital Eccentricity</b><span>{{s.Eccentricity}}</span></em>
                        <em><b>Orbital Inclination</b><span>{{s.OrbitalInclination | nn(2,2)}} <u>°</u></span></em>
                        <em><b>Arg Of Periapsis</b><span>{{s.Periapsis | nn(2,2)}} <u>°</u></span></em>
                        <em><b>Axial Tilt</b><span>{{s.AxialTilt  * 180 / Math.PI | nn(2,2)}} <u>°</u></span></em>
                    </div>

                    <div class="sub" v-if="s.Rings" v-for="ring in s.Rings">
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
</template>

<script>
    export default {
        name: "ev-scan",
        props: {
            rec: {
                type: Object,
                required: true,
            }
        },
        data: function () { return {s: this.rec} },
        methods: {
            // here wil be some methods to analyze body
        }
    }
</script>

<style>

</style>