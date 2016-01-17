var fluid = fluid || require("infusion"),
    flock = flock || require("flocking");

(function () {
    "use strict";

    var relic = fluid.registerNamespace("relic");

    fluid.defaults("relic.bufferLoader", {
        gradeNames: "flock.bufferLoader",

        bufferDefs: "{audioFileManager}.model.inMemoryAudioFiles",

        events: {
            afterBuffersLoaded: "{audioFileManager}.events.onReady"
        },

        listeners: {
            afterBuffersLoaded: {
                funcName: "flock.log.warn",
                args: ["Buffers have been loaded!"]
            }
        }
    });


    fluid.defaults("relic.audioFileManager", {
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
                type: "relic.bufferLoader"
            }
        },

        events: {
            onFileURLsReady: "{audioFileWalker}.events.onComplete",
            onReady: null
        },

        listeners: {
            onCreate: "{audioFileWalker}.walk()",
            onFileURLsReady: [
                {
                    priority: "first",
                    funcName: "relic.audioFileManager.shuffleAndSplitAudioFiles",
                    args: ["{audioFileWalker}.model.audioFiles", "{that}"]
                },
                {
                    funcName: "flock.log.warn",
                    args: ["Loading audio buffers..."]
                }
            ]
        }
    });

    relic.audioFileManager.shuffleAndSplitAudioFiles = function (audioFiles, that) {
        var shuffled = flock.shuffle(audioFiles),
            inMemoryLength = Math.round(audioFiles.length * that.options.inMemoryRatio),
            inMemoryAudioFiles = shuffled.slice(0, inMemoryLength),
            streamingAudioFiles = shuffled.slice(inMemoryLength);

        that.applier.change("inMemoryAudioFiles", inMemoryAudioFiles);
        that.applier.change("streamingAudioFiles", streamingAudioFiles);
    };
}());
