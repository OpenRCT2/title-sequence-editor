/// <reference path="C:/Users/Ted/Documents/GitHub/openrct2/distribution/openrct2.d.ts" />

let main = function () {
    if (typeof ui === 'undefined') {
        console.log("Plugin not available on headless mode.");
        return;
    }

    if (network.mode != "none") {
        console.log("Plugin not available in multiplayer.");
        return;
    }

    // DEBUG:
    ui.closeAllWindows();

    TitleEditorWindow.getOrOpen();
};

registerPlugin({
    name: 'Title Sequence Editor',
    version: '1.0',
    authors: ['OpenRCT2'],
    type: 'remote',
    licence: 'MIT',
    main: main
});
