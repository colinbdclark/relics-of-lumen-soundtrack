var fluid = fluid || require("infusion");

(function () {
    "use strict";

    var electron = fluid.registerNamespace("electron"),
        relic = fluid.registerNamespace("relic"),
        walk = require("walk"),
        path = require("path");

    fluid.defaults("relic.audioFileWalker", {
        gradeNames: "fluid.modelComponent",

        audioExtensions: ["mp4", "m4a", "mp3", "ogg", "oga", "wav"],

        // TODO: Make an "app proxy" component that represents
        // key application/environment features available in a web process.
        directory: __dirname + "/../../../audio",

        walkerOptions: {
            followLinks: false
        },

        members: {
            walker: null // Created as a side-effect of that.walk()
        },

        invokers: {
            walk: "relic.audioFileWalker.walk({that})"
        },

        model: {
            audioFiles: []
        },

        events: {
            onComplete: null,
            onFile: null
        },

        listeners: {
            "onFile.addAudioFile": {
                funcName: "relic.audioFileWalker.addAudioFile",
                args: ["{arguments}.0", "{arguments}.1", "{that}"]
            },

            "onFile.next": {
                priority: "last",
                funcName: "relic.audioFileWalker.nextFile",
                args: ["{arguments}.2"]
            },

            "onComplete.unbindWalkerEvents": {
                priority: "last",
                funcName: "relic.audioFileWalker.mapEvents",
                args: [
                    "removeListener",
                    "{that}.walker",
                    "{that}.options.walkerEventMap",
                    "{that}.events"
                ]
            }
        },

        walkerEventMap: {
            "file": "onFile",
            "end": "onComplete"
        }
    });

    relic.audioFileWalker.mapEvents = function (emitterAction, walker, walkerEventMap, events) {
        fluid.each(walkerEventMap, function (componentEventName, walkerEventName) {
            walker[emitterAction](walkerEventName, events[componentEventName].fire);
        });
    };

    relic.audioFileWalker.walk = function (that) {
        // TODO: Remove direct that-bashing.
        that.walker = walk.walk(that.options.directory, that.options.walkerOptions);
        relic.audioFileWalker.mapEvents("on", that.walker, that.options.walkerEventMap, that.events);
    };

    relic.audioFileWalker.nextFile = function (next) {
        next();
    };

    relic.audioFileWalker.addAudioFile = function (root, fileStat, that) {
        var fileExt = path.extname(fileStat.name).substring(1);

        if (that.options.audioExtensions.indexOf(fileExt) > -1) {
            var url = electron.urlForFilePath(root + "/" + fileStat.name);
            that.model.audioFiles.push(url);
        }

        that.applier.change("audioFiles", that.model.audioFiles);
    };
}());
