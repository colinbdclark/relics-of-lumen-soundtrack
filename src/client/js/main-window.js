var fluid = fluid || require("infusion"),
    flock = flock || require("flocking");

(function () {
    "use strict";

    var electron = fluid.registerNamespace("electron"),
        walk = require("walk"),
        $ = fluid.registerNamespace("jQuery");

    var walker = walk.walk(electron.getAppRootPath() + "audio", {
        followLinks: false
    });

    function getFileExtension(filename) {
        var lastDotIdx = filename.lastIndexOf(".");

        if (lastDotIdx < 0) {
            return;
        }

        return filename.substring(lastDotIdx + 1);
    }

    var supportedAudioExtensions = ["mp4", "m4a", "mp3", "ogg", "oga", "wav", "aiff"];

    var audioFiles = [];

    walker.on("file", function (root, fileStat, next) {
        var fileExt = getFileExtension(fileStat.name);

        if (supportedAudioExtensions.indexOf(fileExt) > -1) {
            audioFiles.push(electron.urlForFilePath(root + "/" + fileStat.name));
        }

        next();
    });

    walker.on("end", function () {
        var randomURL = flock.choose(audioFiles),
            player = $("#audio-player")[0];

        player.src = randomURL;
        player.play();
    });

}());
