var fluid = fluid || require("infusion"),
    flock = flock || require("flocking");

(function () {
    "use strict";

    var relic = fluid.registerNamespace("relic"),
        enviro = flock.init();

    enviro.play();

    // TODO: Rename this once it becomes clear what we're actually doing.
    fluid.defaults("relic.mainWindow", {
        gradeNames: "fluid.modelComponent",

        inMemoryRatio: 1/3,

        model: {
            inMemoryAudioFiles: [],
            streamingAudioFiles: []
        },

        components: {
            audioFileWalker: {
                type: "relic.audioFileWalker"
            },

            bufferLoader: {
                createOnEvent: "onFileURLsReady",
                type: "flock.bufferLoader",
                options: {
                    bufferDefs: "{mainWindow}.model.inMemoryAudioFiles",

                    listeners: {
                        afterBuffersLoaded: {
                            "this": "console",
                            method: "log",
                            args: ["Buffers have loaded!"]
                        }
                    }
                }
            }
        },

        events: {
            onFileURLsReady: "{audioFileWalker}.events.onComplete"
        },

        listeners: {
            onCreate: "{audioFileWalker}.walk()",
            onFileURLsReady: [
                {
                    priority: "first",
                    funcName: "relic.mainWindow.shuffleAndSplitAudioFiles",
                    args: ["{audioFileWalker}.model.audioFiles", "{that}"]
                }
            ]
        }
    });

    relic.mainWindow.shuffleAndSplitAudioFiles = function (audioFiles, that) {
        var shuffled = flock.shuffle(audioFiles),
            inMemoryLength = Math.round(audioFiles.length * that.options.inMemoryRatio),
            inMemoryAudioFiles = shuffled.slice(0, inMemoryLength),
            streamingAudioFiles = shuffled.slice(inMemoryLength);

        that.applier.change("inMemoryAudioFiles", inMemoryAudioFiles);
        that.applier.change("streamingAudioFiles", streamingAudioFiles);
    };
}());
