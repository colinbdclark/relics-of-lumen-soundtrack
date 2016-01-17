var fluid = fluid || require("infusion"),
    flock = flock || require("flocking");

(function () {
    "use strict";

    var relic = fluid.registerNamespace("relic");

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
            buffer: null, // Specified when cloned from the template.
            dur: {
                id: "grainDuration",
                ugen: "flock.ugen.line",
                start: 1/15,
                end: 15,
                duration: 11 * 60
            },
            trigger: {
                ugen: "flock.ugen.dust",
                density: {
                    id: "triggerDensity",
                    ugen: "flock.ugen.xLine",
                    start: 1/5,
                    end: 1/50,
                    duration: 9 * 60
                }
            },
            amp: {
                id: "grainAmplitude",
                ugen: "flock.ugen.line",
                start: 0.1,
                end: 0.02,
                duration: 9 * 60
            },
            centerPos: {
                ugen: "flock.ugen.lfNoise",
                freq: 1/2,
                options: {
                    interpolation: "linear"
                },
                mul: {
                    ugen: "flock.ugen.bufferDuration",
                    rate: "control",
                    buffer: null, // Specified when cloned from the template.
                    mul: {
                        id: "centerPositionLine",
                        ugen: "flock.ugen.xLine",
                        start: 0.01,
                        end: 1.0,
                        duration: 3 * 60
                    }
                }
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
            ugenDef.centerPos.buffer = bufferID;
            ugenDef.centerPos.mul.buffer = bufferID;

            return ugenDef;
        });
    };


    fluid.defaults("relic.band", {
        gradeNames: "flock.band",

        components: {
            randomBufferPlayer: {
                type: "relic.synth.randomBufferPlayer"
            },

            scheduler: {
                type: "flock.scheduler.async",
                options: {
                    listeners: {
                        onCreate: "relic.band.scheduleLoop({band})"
                    }
                }
            }
        }
    });

    relic.band.scheduleLoop = function (band) {
        band.scheduler.repeat(12 * 60, function () {
            var randomBufferPlayer = band.randomBufferPlayer,
                ugens = randomBufferPlayer.nodeList.nodes;

            for (var i = 0; i < ugens.length; i++) {
                var ugen = ugens[i],
                    ugenType = ugen.options.ugenDef.ugen;

                if (ugenType === "flock.ugen.line" || ugenType === "flock.ugen.xLine") {
                    ugen.onInputChanged();
                }
            }

            flock.log.warn("Restarting lines.");
        });
    };
}());
