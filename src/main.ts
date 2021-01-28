/// <reference path="C:/Users/Ted/Documents/GitHub/openrct2/distribution/openrct2.d.ts" />

const main = () => {
    if (typeof ui === 'undefined') {
        console.log("Plugin not available on headless mode.");
        return;
    }

    if (network.mode != "none") {
        console.log("Plugin not available in multiplayer.");
        return;
    }

    ui.registerMenuItem('Title Sequence Editor', () => {
        TitleEditorWindow.getOrOpen();
    });

    TitleEditorWindow.getOrOpen();
    // ui.closeAllWindows();
    // CommandEditorWindow.getOrOpen({ x: ui.width / 2, y: ui.height / 2 }, [], null, () => { });
};

registerPlugin({
    name: 'Title Sequence Editor',
    version: '1.0',
    authors: ['OpenRCT2'],
    type: 'remote',
    licence: 'MIT',
    main: main
});
