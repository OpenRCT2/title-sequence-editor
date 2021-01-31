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
};

registerPlugin({
    name: 'Title Sequence Editor',
    version: '1.0',
    authors: ['OpenRCT2'],
    type: 'remote',
    licence: 'MIT',
    main: main
});
