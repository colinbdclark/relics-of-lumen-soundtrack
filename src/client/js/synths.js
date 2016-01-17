var fluid = fluid || require("infusion"),
    flock = flock || require("flocking");

(function () {
    "use strict";

    var relic = fluid.registerNamespace("relic");

    fluid.defaults("relic.interconnects", {
        gradeNames: "fluid.component",

        grainDuration: "@expand:{flock.enviro}.busManager.acquireNextBus(interconnect)",
        numGrains: "@expand:{flock.enviro}.busManager.acquireNextBus(interconnect)"
    });

    fluid.defaults("relic.synth.grainDuration", {
        gradeNames: "flock.synth",

        synthDef: {
            ugen: "flock.ugen.out",
            bus: "{interconnects}.options.grainDuration",
            expand: 1,
            sources: 1
        }
    });

    fluid.defaults("relic.synth.randomBufferPlayer", {
        gradeNames: "flock.synth",

        // TODO: Change this to a model relay.
        bufferIDs: {
            expander: {
                funcName: "relic.player.collectBufferIDs",
                args: ["{audioFileManager}.bufferLoader.bufferDefs"]
            }
        },

        granulatorTemplate: {
            ugen: "flock.ugen.triggerGrains",
            dur: {
                rate: "control",
                ugen: "flock.ugen.in",
                bus: "{interconnects}.options.grainDuration"
            },
            trigger: {
                ugen: "flock.ugen.dust",
                density: 1/60
            }
        },

        synthDef: {
            ugen: "flock.ugen.sum",
            sources: {
                expander: {
                    funcName: "relic.synth.randomBufferPlayer.cloneGranulators",
                    args: ["{that}.options.granulatorTemplate", "{that}.options.bufferIDs"]
                }
            }
        }
    });

    relic.synth.randomBufferPlayer.cloneGranulators = function (granulatorTemplate, bufferIDs) {
        return fluid.transform(bufferIDs, function (bufferID) {
            var ugenDef = fluid.copy(granulatorTemplate);
            ugenDef.buffer = bufferID;
            return ugenDef;
        });
    };


    fluid.defaults("relic.band", {
        gradeNames: "flock.band",

        components: {
            interconnects: {
                type: "relic.interconnects"
            },

            grainDuration: {
                type: "relic.synth.grainDuration",
                options: {
                    addToEnvironment: 0
                }
            },

            randomBufferPlayer: {
                type: "relic.synth.randomBufferPlayer",
                options: {
                    addToEnvironment: 1
                }
            }
        }
    });
}());
