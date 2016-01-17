var fluid = fluid || require("infusion"),
    flock = flock || require("flocking");

(function () {
    "use strict";

    var relic = fluid.registerNamespace("relic");

    flock.init({
        numBuses: 16
    });

    fluid.defaults("relic.player", {
        gradeNames: "fluid.component",

        components: {
            band: {
                createOnEvent: "onReady",
                type: "relic.band"
            },

            audioFileManager: {
                type: "relic.audioFileManager"
            }
        },

        events: {
            onReady: "{audioFileManager}.events.onReady"
        },

        listeners: {
            onCreate: [
                "{flock.enviro}.play()"
            ]
        }
    });

    relic.player.collectBufferIDs = function (bufferDefs) {
        return fluid.transform(bufferDefs, function (bufferDef) {
            return bufferDef.id;
        });
    };
}());
