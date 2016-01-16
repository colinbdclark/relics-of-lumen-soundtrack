"use strict";

var fluid = require("infusion"),
    electron = require("infusion-electron");

console.log(electron.appSingleton.getAppPath());

fluid.defaults("relics.app", {
    gradeNames: "electron.app",

    commandLineSwitches: {
        "disable-renderer-backgrounding": null
    },

    components: {
        mainWindow: {
            createOnEvent: "onReady",
            type: "electron.unthrottledWindow",
            options: {
                windowOptions: {
                    title: "Relics of Lumen Soundtrack"
                },

                model: {
                    url: {
                        expander: {
                            funcName: "fluid.stringTemplate",
                            args: ["%appRootURL/src/client/html/main-window.html", "{app}.env"]
                        }
                    },

                    dimensions: {
                        width: 1920,
                        height: 1080
                    }
                }
            }
        }
    }
});
