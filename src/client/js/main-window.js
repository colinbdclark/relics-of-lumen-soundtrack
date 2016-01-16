var fluid = fluid || require("infusion"),
    flock = flock || require("flocking");

(function () {
    "use strict";

    var relic = fluid.registerNamespace("relic"),
        audioFileWalker = relic.audioFileWalker();

    audioFileWalker.walk();
}());
