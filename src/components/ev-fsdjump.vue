<template>
    <div class="ev fsdjump">
        <h2>
            <span class="event">fsd jump: </span>
            <span class="system solid-word"> {{jump.StarSystem}}</span>
            <small>{{jump.timestamp}}</small>
        </h2>
        <div class="dist">
            <small>STAR POS :: <u v-for="x in jump.StarPos">{{x/32 | nn(2)}}; </u></small>
            <br>
            <b>{{jump.JumpDist}} Ly.</b>
        </div>
    </div>
</template>

<script>
    export default {
        name: "ev-fsdjump",
        props: {
            rec: {
                type: Object,
                required: true,
            }
        },
        data: function () { return {jump: this.rec} },
        methods: {
            // here wil be some methods to analyze body
        }
    }
</script>

<style lang="scss">
    @import '../styles/vars';
    .ev.fsdjump {
        h2 {
            padding: 0.2em 0;
            .event { color: $purple}
            .system { color: lighten($ui-text, 20%)}
            small { display: block; color: darken($ui-text, 20%)}
        }
    }
</style>