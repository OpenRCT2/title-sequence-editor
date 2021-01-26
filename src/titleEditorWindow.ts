const SPR_G2_BEGIN = 29357;
const SPR_G2_TITLE_RESTART = SPR_G2_BEGIN + 28;
const SPR_G2_TITLE_STOP = SPR_G2_BEGIN + 29;
const SPR_G2_TITLE_PLAY = SPR_G2_BEGIN + 30;
const SPR_G2_TITLE_SKIP = SPR_G2_BEGIN + 31;

namespace Path {
    export function getBaseName(path: string) {
        const a = path.lastIndexOf('\\');
        const b = path.lastIndexOf('/');
        const lastSlash = Math.max(a, b);
        return lastSlash === -1 ? path : path.substr(lastSlash + 1);
    }

    export function getBaseNameWithoutExtension(path: string) {
        const baseName = getBaseName(path);
        const dotIndex = path.lastIndexOf('.');
        return dotIndex === -1 ? baseName : baseName.substr(0, dotIndex);
    }

    export function getExtension(path: string) {
        const dotIndex = path.lastIndexOf('.');
        return dotIndex === -1 ? '' : path.substr(dotIndex);
    }
}

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
        return new TitleEditorWindow();
    }

    constructor() {
        const width = 320;
        const height = 127;
        this.window = ui.openWindow({
            classification: TitleEditorWindow.className,
            title: getString('STR_TITLE_EDITOR_TITLE'),
            colours: [1, 15, 15],
            x: (ui.width - width) / 2,
            y: (ui.height - height) / 2,
            width: width,
            height: height,
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
                        <ButtonWidget>{ name: 'btn-remove', type: "button", x: 8, y: 52 + (1 * 18), width: 72, height: 12, onClick: () => this.onRemoveParkClick(), text: getString('STR_TITLE_EDITOR_ACTION_REMOVE'), tooltip: getString('STR_TITLE_EDITOR_ACTION_REMOVE_TIP') },
                        <ButtonWidget>{ name: 'btn-rename', type: "button", x: 8, y: 52 + (2 * 18), width: 72, height: 12, onClick: () => this.onRenameParkClick(), text: getString('STR_TITLE_EDITOR_ACTION_RENAME'), tooltip: getString('STR_TITLE_EDITOR_ACTION_RENAME_TIP') },
                        <ButtonWidget>{ name: 'btn-load', type: "button", x: 8, y: 52 + (3 * 18), width: 72, height: 12, onClick: () => this.onLoadParkClick(), text: getString('STR_TITLE_EDITOR_ACTION_LOAD'), tooltip: getString('STR_TITLE_EDITOR_ACTION_LOAD_TIP') },

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
                        <ButtonWidget>{ name: 'btn-insert', type: "button", x: 8, y: 52 + (0 * 18), width: 72, height: 12, onClick: () => this.onInsertCommand(), text: getString('STR_TITLE_EDITOR_ACTION_INSERT'), tooltip: getString('STR_TITLE_EDITOR_ACTION_INSERT_TIP') },
                        <ButtonWidget>{ name: 'btn-edit', type: "button", x: 8, y: 52 + (1 * 18), width: 72, height: 12, onClick: () => this.onEditCommand(), text: getString('STR_TITLE_EDITOR_ACTION_EDIT'), tooltip: getString('STR_TITLE_EDITOR_ACTION_EDIT_TIP') },
                        <ButtonWidget>{ name: 'btn-delete', type: "button", x: 8, y: 52 + (2 * 18), width: 72, height: 12, onClick: () => this.onDeleteCommand(), text: getString('STR_TITLE_EDITOR_ACTION_DELETE'), tooltip: getString('STR_TITLE_EDITOR_ACTION_DELETE_TIP') },
                        <ButtonWidget>{ name: 'btn-skipto', type: "button", x: 8, y: 52 + (3 * 18), width: 72, height: 12, text: getString('STR_TITLE_EDITOR_ACTION_SKIP_TO'), tooltip: getString('STR_TITLE_EDITOR_ACTION_SKIP_TO_TIP') },
                        <ButtonWidget>{ name: 'btn-moveup', type: "button", x: 8, y: 52 + (5 * 18), width: 36, height: 12, text: '▲', onClick: () => this.onMoveCommandUp(), tooltip: getString('STR_TITLE_EDITOR_ACTION_MOVE_DOWN_TIP') },
                        <ButtonWidget>{ name: 'btn-movedown', type: "button", x: 44, y: 52 + (5 * 18), width: 36, height: 12, text: '▼', onClick: () => this.onMoveCommandDown(), tooltip: getString('STR_TITLE_EDITOR_ACTION_MOVE_UP_TIP') },

                        <ButtonWidget>{ name: 'btn-replay', type: "button", x: 8 + (0 * 18), y: 270, width: 18, height: 16, image: SPR_G2_TITLE_RESTART, tooltip: getString('STR_TITLE_EDITOR_ACTION_REPLAY_TIP'), border: true },
                        <ButtonWidget>{ name: 'btn-stop', type: "button", x: 8 + (1 * 18), y: 270, width: 18, height: 16, image: SPR_G2_TITLE_STOP, tooltip: getString('STR_TITLE_EDITOR_ACTION_STOP_TIP'), border: true },
                        <ButtonWidget>{ name: 'btn-play', type: "button", x: 8 + (2 * 18), y: 270, width: 18, height: 16, image: SPR_G2_TITLE_PLAY, tooltip: getString('STR_TITLE_EDITOR_ACTION_PLAY_TIP'), border: true },
                        <ButtonWidget>{ name: 'btn-skip', type: "button", x: 8 + (3 * 18), y: 270, width: 18, height: 16, image: SPR_G2_TITLE_SKIP, tooltip: getString('STR_TITLE_EDITOR_ACTION_SKIP_TIP'), border: true },

                        <ListView>{ name: "list", type: "listview", x: 89, y: 48, width: 320, height: 270, scroll: "both", isStriped: true, canSelect: true, columns: [{ width: 80 }, {}], onClick: () => this.onCommandSelect() }
                    ]
                }
            ]
        });
        if (!this.window) {
            throw new Error();
        }
        this.refreshSequences();
    }

    performLayout() {
        for (const name of ['btn-replay', 'btn-stop', 'btn-play', 'btn-skip']) {
            const button = this.window.findWidget(name);
            if (button) {
                button.y = this.window.height - 32;
                button.isDisabled = true;
            }
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
                break;
            case TitleEditorWindow.tabCommands:
                this.window.minWidth = 320;
                this.window.maxWidth = 500;
                this.window.minHeight = 270;
                this.window.maxHeight = 580;
                this.refreshCommands();
                break;
        }
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
        ui.showFileBrowse({
            type: 'load',
            fileType: 'game',
            callback: path => {
                const titleSequence = this.getSelectedTitleSequence();
                if (titleSequence) {
                    let fileName = this.getUniqueFileName(path);
                    titleSequence.addPark(path, fileName);
                    this.refreshParks();
                }
            }
        });
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
                    if (this.fileNameExists(value)) {
                        ui.showError("Can't rename park", "Name already exists");
                    } else {
                        park.fileName = value;
                        this.refreshParks();
                    }
                }
            });
        }
    }

    onLoadParkClick() {

    }

    onInsertCommand() {
        const pos = {
            x: this.window.x + (this.window.width / 2),
            y: this.window.y + (this.window.height / 2)
        };
        CommandEditorWindow.getOrOpen(pos, null, command => {
            const titleSequence = this.getSelectedTitleSequence();
            if (titleSequence) {
                let commands = titleSequence.commands;
                const selectedIndex = this.getSelectedCommandIndex();
                let insertIndex: number;
                if (selectedIndex === undefined) {
                    commands.push(command);
                    insertIndex = commands.length - 1;
                } else {
                    commands.splice(selectedIndex, 0, command);
                    insertIndex = selectedIndex;
                }
                titleSequence.commands = commands;
                this.refreshCommands();
                this.setSelectedCommandIndex(insertIndex);
            }
        });
    }

    onEditCommand() {
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence) {
            const selectedIndex = this.getSelectedCommandIndex();
            if (selectedIndex !== undefined) {
                const pos = {
                    x: this.window.x + (this.window.width / 2),
                    y: this.window.y + (this.window.height / 2)
                };
                const command = titleSequence.commands[selectedIndex];
                CommandEditorWindow.getOrOpen(pos, command, command => {
                    titleSequence.commands[selectedIndex] = command;
                    this.refreshCommands();
                });
            }
        }
    }

    onDeleteCommand() {
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence) {
            const listView = this.window.findWidget<ListView>('list');
            if (listView) {
                const selectedIndex = this.getSelectedCommandIndex();
                if (selectedIndex !== undefined) {
                    let commands = titleSequence.commands;
                    commands.splice(selectedIndex, 1);
                    titleSequence.commands = commands;
                    this.refreshCommands();
                }
            }
        }
    }

    onMoveCommandUp() {
        return this.onMoveCommand(-1);
    }

    onMoveCommandDown() {
        return this.onMoveCommand(1);
    }

    onMoveCommand(delta: -1 | 1) {
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence) {
            const selectedIndex = this.getSelectedCommandIndex();
            if (selectedIndex !== undefined) {
                let commands = titleSequence.commands;
                const otherIndex = selectedIndex + delta;
                if (otherIndex >= 0 && otherIndex < commands.length) {
                    const tmp = commands[otherIndex];
                    commands[otherIndex] = commands[selectedIndex];
                    commands[selectedIndex] = tmp;
                    titleSequence.commands = commands;
                    this.setSelectedCommandIndex(otherIndex);
                    this.refreshCommands();
                }
            }
        }
    }

    onCommandSelect() {
        this.refreshCommandButtons();
    }

    getSelectedCommandIndex() {
        const listView = this.window.findWidget<ListView>('list');
        if (listView) {
            return listView.selectedCell?.row;
        }
        return undefined;
    }

    setSelectedCommandIndex(index: number) {
        const listView = this.window.findWidget<ListView>('list');
        if (listView) {
            listView.selectedCell = { row: index, column: 0 };
        }
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

    static getCommandArgument(parks: TitleSequencePark[], cmd: TitleSequenceCommand) {
        switch (cmd.type) {
            case 'load':
                if (cmd.index >= 0 && cmd.index < parks.length) {
                    return parks[cmd.index].fileName;
                } else {
                    return 'No save selected';
                }
            case 'location':
                return `${cmd.x}, ${cmd.y}`;
            case 'rotate':
                return cmd.rotations.toString();
            case 'zoom':
                return cmd.zoom.toString();
            case 'follow':
                return cmd.id === null ? "<none>" : cmd.id.toString();
            case 'speed':
                return cmd.speed.toString();
            case 'wait':
                return cmd.duration.toString();
            case 'loadsc':
                return cmd.scenario;
        }
        return "";
    }

    refreshCommands() {
        const titleSequence = this.getSelectedTitleSequence();

        const listView = this.window.findWidget<ListView>('list');
        if (listView) {
            if (titleSequence) {
                listView.items = titleSequence.commands.map(x => {
                    const descriptor = getCommandDescriptor(x.type);
                    if (descriptor) {
                        const arg = TitleEditorWindow.getCommandArgument(titleSequence.parks, x);
                        return [getString(descriptor.name), arg];
                    } else {
                        return ['Unknown', ''];
                    }
                });
            } else {
                listView.items = [];
            }
        }

        this.refreshCommandButtons();
    }

    refreshCommandButtons() {
        const insertButton = this.window.findWidget<ButtonWidget>('btn-insert');
        const editButton = this.window.findWidget<ButtonWidget>('btn-edit');
        const deleteButton = this.window.findWidget<ButtonWidget>('btn-delete');
        const skipToButton = this.window.findWidget<ButtonWidget>('btn-skipto');
        const moveUpButton = this.window.findWidget<ButtonWidget>('btn-moveup');
        const moveDownButton = this.window.findWidget<ButtonWidget>('btn-movedown');

        const titleSequence = this.getSelectedTitleSequence();
        const isReadOnly = titleSequence?.isReadOnly !== false;
        const selectedIndex = this.getSelectedCommandIndex();
        const numCommands = titleSequence?.commands.length || 0;

        if (insertButton) {
            insertButton.isDisabled = isReadOnly;
        }

        for (const btn of [editButton, deleteButton]) {
            if (btn) {
                btn.isDisabled = isReadOnly || selectedIndex === undefined;
            }
        }

        if (skipToButton) {
            skipToButton.isDisabled = selectedIndex === undefined;
        }

        if (moveUpButton) {
            moveUpButton.isDisabled = isReadOnly || selectedIndex === undefined || selectedIndex <= 0;
        }

        if (moveDownButton) {
            moveDownButton.isDisabled = isReadOnly || selectedIndex === undefined || selectedIndex >= numCommands - 1;
        }
    }

    getUniqueFileName(path: string) {
        let fileName = Path.getBaseName(path);
        if (this.fileNameExists(fileName)) {
            const left = Path.getBaseNameWithoutExtension(fileName);
            const right = Path.getExtension(fileName);
            let number = 2;
            do {
                fileName = left + number.toString() + right;
                number++;
            } while (this.fileNameExists(fileName));
        }
        return fileName;
    }

    fileNameExists(fileName: string) {
        fileName = fileName.toLowerCase();
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence) {
            for (const park of titleSequence.parks) {
                if (park.fileName.toLowerCase() === fileName) {
                    return true;
                }
            }
        }
        return false;
    }
}
