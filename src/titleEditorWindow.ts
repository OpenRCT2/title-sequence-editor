const SPR_G2_BEGIN = 29357;
const SPR_G2_TITLE_RESTART = SPR_G2_BEGIN + 29;
const SPR_G2_TITLE_STOP = SPR_G2_BEGIN + 30;
const SPR_G2_TITLE_PLAY = SPR_G2_BEGIN + 31;
const SPR_G2_TITLE_SKIP = SPR_G2_BEGIN + 32;

const showInputBox = (title: string, text: string, value: string, callback: (value: string) => void) => {
    ui.showTextInput({
        title: title,
        description: text,
        initialValue: value,
        callback: callback
    })
};

class TitleEditorWindow {
    static readonly className = 'title-sequence-editor';

    static readonly tabSequences = 0;
    static readonly tabParks = 1;
    static readonly tabCommands = 2;

    window: Window;
    titleSequences: TitleSequence[] = [];
    currentSequence: number | undefined;

    static getOrOpen() {
        var w = ui.getWindow(TitleEditorWindow.className);
        if (w) {
            w.close();
        }
        let result = new TitleEditorWindow();
        return result.open();
    }

    open() {
        this.window = ui.openWindow({
            classification: TitleEditorWindow.className,
            title: getString('STR_TITLE_EDITOR_TITLE'),
            colours: [1, 15, 15],
            width: 320,
            height: 127,
            widgets: [],
            onUpdate: () => this.onUpdate(),
            onTabChange: () => this.onTabChange(),
            tabs: [
                {
                    image: {
                        frameBase: 5442,
                        frameCount: 16,
                        frameDuration: 4
                    },
                    widgets: [
                        <LabelWidget>{ type: "label", x: 10, y: 60, width: 91, height: 12, text: getString('STR_TITLE_SEQUENCE') },
                        <DropdownWidget>{ type: "dropdown", x: 125, y: 60, width: 175, height: 12, onChange: index => this.onSequenceChange(index), name: 'dropdown-sequence' },
                        <ButtonWidget>{ type: "button", x: 10, y: 82, width: 91, height: 12, onClick: () => this.onCreateSequenceClick(), text: getString('STR_TITLE_EDITOR_ACTION_CREATE'), tooltip: getString('STR_TITLE_EDITOR_ACTION_CREATE_SEQUENCE_TIP') },
                        <ButtonWidget>{ type: "button", x: 10, y: 102, width: 91, height: 12, onClick: () => this.onDuplicateSequenceClick(), text: getString('STR_TITLE_EDITOR_ACTION_DUPLICATE'), tooltip: getString('STR_TITLE_EDITOR_ACTION_DUPLICATE_SEQUENCE_TIP') },
                        <ButtonWidget>{ type: "button", x: 110, y: 82, width: 91, height: 12, name: 'btn-delete', onClick: () => this.onDeleteSequenceClick(), text: getString('STR_TITLE_EDITOR_ACTION_DELETE'), tooltip: getString('STR_TITLE_EDITOR_ACTION_DELETE_SEQUENCE_TIP') },
                        <ButtonWidget>{ type: "button", x: 210, y: 82, width: 91, height: 12, name: 'btn-rename', onClick: () => this.onRenameSequenceClick(), text: getString('STR_TITLE_EDITOR_ACTION_RENAME'), tooltip: getString('STR_TITLE_EDITOR_ACTION_RENAME_SEQUENCE_TIP') }
                    ]
                },
                {
                    image: {
                        frameBase: 5183,
                        offset: { x: 4, y: 1 }
                    },
                    widgets: [
                        <ButtonWidget>{ name: 'btn-add', type: "button", x: 8, y: 52 + (0 * 18), width: 72, height: 12, onClick: () => this.onAddParkClick(), text: getString('STR_TITLE_EDITOR_ACTION_ADD'), tooltip: getString('STR_TITLE_EDITOR_ACTION_ADD_TIP') },
                        <ButtonWidget>{ name: 'btn-remove', type: "button", x: 8, y: 52 + (1 * 18), width: 72, height: 12, onClick: () => this.onRemoveParkClick(),text: getString('STR_TITLE_EDITOR_ACTION_REMOVE'), tooltip: getString('STR_TITLE_EDITOR_ACTION_REMOVE_TIP') },
                        <ButtonWidget>{ name: 'btn-rename', type: "button", x: 8, y: 52 + (2 * 18), width: 72, height: 12, onClick: () => this.onRenameParkClick(),text: getString('STR_TITLE_EDITOR_ACTION_RENAME'), tooltip: getString('STR_TITLE_EDITOR_ACTION_RENAME_TIP') },
                        <ButtonWidget>{ name: 'btn-load', type: "button", x: 8, y: 52 + (3 * 18), width: 72, height: 12, onClick: () => this.onLoadParkClick(),text: getString('STR_TITLE_EDITOR_ACTION_LOAD'), tooltip: getString('STR_TITLE_EDITOR_ACTION_LOAD_TIP') },

                        <ButtonWidget>{ name: 'btn-replay', type: "button", x: 8 + (0 * 18), y: 270, width: 18, height: 16, image: SPR_G2_TITLE_RESTART, tooltip: getString('STR_TITLE_EDITOR_ACTION_REPLAY_TIP'), border: true },
                        <ButtonWidget>{ name: 'btn-stop', type: "button", x: 8 + (1 * 18), y: 270, width: 18, height: 16, image: SPR_G2_TITLE_STOP, tooltip: getString('STR_TITLE_EDITOR_ACTION_STOP_TIP'), border: true },
                        <ButtonWidget>{ name: 'btn-play', type: "button", x: 8 + (2 * 18), y: 270, width: 18, height: 16, image: SPR_G2_TITLE_PLAY, tooltip: getString('STR_TITLE_EDITOR_ACTION_PLAY_TIP'), border: true },
                        <ButtonWidget>{ name: 'btn-skip', type: "button", x: 8 + (3 * 18), y: 270, width: 18, height: 16, image: SPR_G2_TITLE_SKIP, tooltip: getString('STR_TITLE_EDITOR_ACTION_SKIP_TIP'), border: true },

                        <ListView>{ name: "list", type: "listview", x: 89, y: 48, width: 320, height: 270, scroll: "both", isStriped: true, canSelect: true }
                    ]
                },
                {
                    image: {
                        frameBase: 5277,
                        frameCount: 7,
                        frameDuration: 4
                    },
                    widgets: [
                        <ButtonWidget>{ type: "button", x: 8, y: 52 + (0 * 18), width: 72, height: 12, text: getString('STR_TITLE_EDITOR_ACTION_INSERT'), tooltip: getString('STR_TITLE_EDITOR_ACTION_INSERT_TIP') },
                        <ButtonWidget>{ type: "button", x: 8, y: 52 + (1 * 18), width: 72, height: 12, text: getString('STR_TITLE_EDITOR_ACTION_EDIT'), tooltip: getString('STR_TITLE_EDITOR_ACTION_EDIT_TIP') },
                        <ButtonWidget>{ type: "button", x: 8, y: 52 + (2 * 18), width: 72, height: 12, text: getString('STR_TITLE_EDITOR_ACTION_DELETE'), tooltip: getString('STR_TITLE_EDITOR_ACTION_DELETE_TIP') },
                        <ButtonWidget>{ name: 'btn-skipto', type: "button", x: 8, y: 52 + (3 * 18), width: 72, height: 12, text: getString('STR_TITLE_EDITOR_ACTION_SKIP_TO'), tooltip: getString('STR_TITLE_EDITOR_ACTION_SKIP_TO_TIP') },
                        <ButtonWidget>{ type: "button", x: 8, y: 52 + (5 * 18), width: 36, height: 12, text: '▲', tooltip: getString('STR_TITLE_EDITOR_ACTION_MOVE_DOWN_TIP') },
                        <ButtonWidget>{ type: "button", x: 44, y: 52 + (5 * 18), width: 36, height: 12, text: '▼', tooltip: getString('STR_TITLE_EDITOR_ACTION_MOVE_UP_TIP') },

                        <ButtonWidget>{ name: 'btn-replay', type: "button", x: 8 + (0 * 18), y: 270, width: 18, height: 16, image: SPR_G2_TITLE_RESTART, tooltip: getString('STR_TITLE_EDITOR_ACTION_REPLAY_TIP'), border: true },
                        <ButtonWidget>{ name: 'btn-stop', type: "button", x: 8 + (1 * 18), y: 270, width: 18, height: 16, image: SPR_G2_TITLE_STOP, tooltip: getString('STR_TITLE_EDITOR_ACTION_STOP_TIP'), border: true },
                        <ButtonWidget>{ name: 'btn-play', type: "button", x: 8 + (2 * 18), y: 270, width: 18, height: 16, image: SPR_G2_TITLE_PLAY, tooltip: getString('STR_TITLE_EDITOR_ACTION_PLAY_TIP'), border: true },
                        <ButtonWidget>{ name: 'btn-skip', type: "button", x: 8 + (3 * 18), y: 270, width: 18, height: 16, image: SPR_G2_TITLE_SKIP, tooltip: getString('STR_TITLE_EDITOR_ACTION_SKIP_TIP'), border: true },

                        <ListView>{ name: "list", type: "listview", x: 89, y: 48, width: 320, height: 270, scroll: "both", isStriped: true, columns: [{ width: 80 }, {}] }
                    ]
                }
            ]
        });
        this.refreshSequences();
        return this.window;
    }

    performLayout() {
        for (const name of ['btn-replay', 'btn-stop', 'btn-play', 'btn-skip']) {
            const button = this.window.findWidget(name);
            if (button) {
                button.y = this.window.height - 32;
                button.isDisabled = true;
            }
        }

        const skipToButton = this.window.findWidget('btn-skipto');
        if (skipToButton) {
            skipToButton.isDisabled = true;
        }

        const listView = this.window.findWidget('list');
        if (listView) {
            listView.width = this.window.width - 4 - listView.x;
            listView.height = this.window.height - 16 - listView.y;
        }
    }

    onTabChange() {
        switch (this.window.tabIndex) {
            case TitleEditorWindow.tabSequences:
                this.window.minWidth = 320;
                this.window.maxWidth = 320;
                this.window.minHeight = 127;
                this.window.maxHeight = 127;
                this.refreshSelectedSequence();
                break;
            case TitleEditorWindow.tabParks:
                this.window.minWidth = 320;
                this.window.maxWidth = 500;
                this.window.minHeight = 270;
                this.window.maxHeight = 580;
                this.refreshParks();
            case TitleEditorWindow.tabCommands:
                this.window.minWidth = 320;
                this.window.maxWidth = 500;
                this.window.minHeight = 270;
                this.window.maxHeight = 580;
                this.refreshCommands();
                break;
        }

        // const listView = this.window.findWidget<ListView>('list');
        // if (listView) {
        //     if (this.window.tabIndex === 1) {
        //         listView.items = [
        //             "donkey.sv6",
        //             "some_other_save.sv6"
        //         ];
        //     }
        //     if (this.window.tabIndex === 2) {
        //         listView.items = [
        //             ["Load", "CocoaBayou.sv6"],
        //             ["Rotate", "2"],
        //             ["Location", "85 67"],
        //             ["Wait", "11600"],
        //             ["Rotate", "3"],
        //             ["Location", "68 52"],
        //             ["Wait", "9700"],
        //             ["Load", "NinSFOT.sv6"],
        //             ["Rotate", "3"],
        //             ["Location", "55 164"],
        //             ["Wait", "9900"]
        //         ];
        //     }
        // }
    }

    onUpdate() {
        this.performLayout();
    }

    static showNamePrompt(titleStringId: string, initialValue: string, callback: (name: string) => void) {
        return showInputBox(getString(titleStringId), getString('STR_TITLE_EDITOR_ENTER_NAME_FOR_SEQUENCE'), initialValue, callback);
    }

    onSequenceChange(index: number) {
        this.currentSequence = index;
        this.refreshSelectedSequence();
    }

    onCreateSequenceClick() {
        TitleEditorWindow.showNamePrompt('STR_TITLE_EDITOR_ACTION_CREATE', "", name => {
            if (name) {
                titleSequenceManager.create(name);
                this.refreshSequences();
                this.setSelectedTitleSequence(name);
            }
        });
    }

    onDuplicateSequenceClick() {
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence) {
            TitleEditorWindow.showNamePrompt('STR_TITLE_EDITOR_ACTION_DUPLICATE', "", name => {
                if (name) {
                    titleSequence.clone(name);
                    this.refreshSequences();
                    this.setSelectedTitleSequence(name);
                }
            });
        }
    }

    onDeleteSequenceClick() {
        // TODO add confirm prompt
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence && !titleSequence.isReadOnly) {
            titleSequence.delete();
            this.refreshSequences();
        }
    }

    onRenameSequenceClick() {
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence) {
            TitleEditorWindow.showNamePrompt('STR_TITLE_EDITOR_ACTION_RENAME', titleSequence.name, name => {
                if (name && name !== titleSequence.name) {
                    titleSequence.name = name;
                    this.refreshSequences();
                }
            });
        }
    }

    onAddParkClick() {
    }

    onRemoveParkClick() {
        const park = this.getSelectedPark();
        if (park) {
            park.delete();
            this.refreshParks();
        }
    }

    onRenameParkClick() {
        const park = this.getSelectedPark();
        if (park) {
            showInputBox('Rename', 'New file name for park', park.fileName, value => {
                if (value) {
                    park.fileName = value;
                    this.refreshParks();
                }
            });
        }
    }

    onLoadParkClick() {

    }

    refreshSequences(): void {
        const seqDropdown = this.window.findWidget<DropdownWidget>('dropdown-sequence');
        if (seqDropdown) {
            let originalSequenceName = this.getSelectedTitleSequence()?.name;
            this.titleSequences = titleSequenceManager.titleSequences;
            seqDropdown.items = this.titleSequences.map(x => x.name);
            this.currentSequence = seqDropdown.selectedIndex;
            if (originalSequenceName) {
                this.setSelectedTitleSequence(originalSequenceName);
            }
        }
        this.refreshSelectedSequence();
    }

    refreshSelectedSequence() {
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence) {
            const deleteButton = this.window.findWidget<ButtonWidget>('btn-delete');
            if (deleteButton) {
                deleteButton.isDisabled = titleSequence.isReadOnly;
            }

            const renameButton = this.window.findWidget<ButtonWidget>('btn-rename');
            if (renameButton) {
                renameButton.isDisabled = titleSequence.isReadOnly;
            }
        }
    }

    setSelectedTitleSequence(name: string) {
        const seqDropdown = this.window.findWidget<DropdownWidget>('dropdown-sequence');
        if (seqDropdown) {
            for (let i = 0; i < this.titleSequences.length; i++) {
                if (this.titleSequences[i].name === name) {
                    seqDropdown.selectedIndex = i;
                    this.currentSequence = i;
                    break;
                }
            }
        }
    }

    getSelectedTitleSequence() {
        if (this.currentSequence !== undefined && this.currentSequence < this.titleSequences.length) {
            return this.titleSequences[this.currentSequence];
        }
        return null;
    }

    getSelectedPark() {
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence) {
            const listView = this.window.findWidget<ListView>('list');
            if (listView && listView.selectedCell) {
                const index = listView.selectedCell.row;
                const parks = titleSequence.parks;
                if (parks && index < parks.length) {
                    return titleSequence.parks[index];
                }
            }
        }
        return null;
    }

    refreshParks() {
        const titleSequence = this.getSelectedTitleSequence();

        const listView = this.window.findWidget<ListView>('list');
        if (listView) {
            if (titleSequence) {
                listView.items = titleSequence.parks.map(x => x.fileName);
            } else {
                listView.items = [];
            }
        }

        let isReadOnly = true;
        if (titleSequence) {
            isReadOnly = titleSequence.isReadOnly;
        }

        for (const name of ['btn-add', 'btn-rename', 'btn-remove', 'btn-load']) {
            const btn = this.window.findWidget<ButtonWidget>(name);
            if (btn) {
                btn.isDisabled = isReadOnly;
            }
        }
    }

    refreshCommands() {

    }
}
