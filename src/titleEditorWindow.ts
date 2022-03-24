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

    static lastSequence: string | undefined;

    window: Window;
    titleSequences: TitleSequence[] = [];
    currentSequence: number | undefined;
    currentRenderedPosition: number | null = null;

    static getOrOpen(initialTabIndex?: number) {
        var w = ui.getWindow(TitleEditorWindow.className);
        if (w) {
            w.close();
        }
        return new TitleEditorWindow(initialTabIndex);
    }

    constructor(initialTabIndex?: number) {
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
            onClose: () => this.onClose(),
            onUpdate: () => this.onUpdate(),
            onTabChange: () => this.onTabChange(),
            tabIndex: initialTabIndex,
            tabs: [
                {
                    image: {
                        frameBase: 5442,
                        frameCount: 16,
                        frameDuration: 4
                    },
                    widgets: [
                        { type: "label", x: 10, y: 60, width: 91, height: 12, text: getString('STR_TITLE_SEQUENCE') },
                        { type: "dropdown", x: 125, y: 60, width: 175, height: 12, onChange: index => this.onSequenceChange(index), name: 'dropdown-sequence' },
                        { type: "button", x: 10, y: 82, width: 91, height: 12, onClick: () => this.onCreateSequenceClick(), text: getString('STR_TITLE_EDITOR_ACTION_CREATE'), tooltip: getString('STR_TITLE_EDITOR_ACTION_CREATE_SEQUENCE_TIP') },
                        { type: "button", x: 10, y: 102, width: 91, height: 12, onClick: () => this.onDuplicateSequenceClick(), text: getString('STR_TITLE_EDITOR_ACTION_DUPLICATE'), tooltip: getString('STR_TITLE_EDITOR_ACTION_DUPLICATE_SEQUENCE_TIP') },
                        { type: "button", x: 110, y: 82, width: 91, height: 12, name: 'btn-delete', onClick: () => this.onDeleteSequenceClick(), text: getString('STR_TITLE_EDITOR_ACTION_DELETE'), tooltip: getString('STR_TITLE_EDITOR_ACTION_DELETE_SEQUENCE_TIP') },
                        { type: "button", x: 210, y: 82, width: 91, height: 12, name: 'btn-rename', onClick: () => this.onRenameSequenceClick(), text: getString('STR_TITLE_EDITOR_ACTION_RENAME'), tooltip: getString('STR_TITLE_EDITOR_ACTION_RENAME_SEQUENCE_TIP') }
                    ]
                },
                {
                    image: {
                        frameBase: 5183,
                        offset: { x: 4, y: 1 }
                    },
                    widgets: [
                        { name: 'btn-add', type: "button", x: 8, y: 52 + (0 * 18), width: 72, height: 12, onClick: () => this.onAddParkClick(), text: getString('STR_TITLE_EDITOR_ACTION_ADD'), tooltip: getString('STR_TITLE_EDITOR_ACTION_ADD_TIP') },
                        { name: 'btn-remove', type: "button", x: 8, y: 52 + (1 * 18), width: 72, height: 12, onClick: () => this.onRemoveParkClick(), text: getString('STR_TITLE_EDITOR_ACTION_REMOVE'), tooltip: getString('STR_TITLE_EDITOR_ACTION_REMOVE_TIP') },
                        { name: 'btn-rename', type: "button", x: 8, y: 52 + (2 * 18), width: 72, height: 12, onClick: () => this.onRenameParkClick(), text: getString('STR_TITLE_EDITOR_ACTION_RENAME'), tooltip: getString('STR_TITLE_EDITOR_ACTION_RENAME_TIP') },
                        { name: 'btn-load', type: "button", x: 8, y: 52 + (3 * 18), width: 72, height: 12, onClick: () => this.onLoadParkClick(), text: getString('STR_TITLE_EDITOR_ACTION_LOAD'), tooltip: getString('STR_TITLE_EDITOR_ACTION_LOAD_TIP') },

                        { name: "list", type: "listview", x: 89, y: 48, width: 320, height: 270, scrollbars: "vertical", isStriped: true, canSelect: true, onClick: () => this.onParkSelect() }
                    ]
                },
                {
                    image: {
                        frameBase: 5277,
                        frameCount: 7,
                        frameDuration: 4
                    },
                    widgets: [
                        { name: 'btn-insert', type: "button", x: 8, y: 52 + (0 * 18), width: 72, height: 12, onClick: () => this.onInsertCommand(), text: getString('STR_TITLE_EDITOR_ACTION_INSERT'), tooltip: getString('STR_TITLE_EDITOR_ACTION_INSERT_TIP') },
                        { name: 'btn-edit', type: "button", x: 8, y: 52 + (1 * 18), width: 72, height: 12, onClick: () => this.onEditCommand(), text: getString('STR_TITLE_EDITOR_ACTION_EDIT'), tooltip: getString('STR_TITLE_EDITOR_ACTION_EDIT_TIP') },
                        { name: 'btn-delete', type: "button", x: 8, y: 52 + (2 * 18), width: 72, height: 12, onClick: () => this.onDeleteCommand(), text: getString('STR_TITLE_EDITOR_ACTION_DELETE'), tooltip: getString('STR_TITLE_EDITOR_ACTION_DELETE_TIP') },
                        { name: 'btn-skipto', type: "button", x: 8, y: 52 + (3 * 18), width: 72, height: 12, onClick: () => this.onSkipTo(), text: getString('STR_TITLE_EDITOR_ACTION_SKIP_TO'), tooltip: getString('STR_TITLE_EDITOR_ACTION_SKIP_TO_TIP') },
                        { name: 'btn-moveup', type: "button", x: 8, y: 52 + (5 * 18), width: 36, height: 12, text: '▲', onClick: () => this.onMoveCommandUp(), tooltip: getString('STR_TITLE_EDITOR_ACTION_MOVE_DOWN_TIP') },
                        { name: 'btn-movedown', type: "button", x: 44, y: 52 + (5 * 18), width: 36, height: 12, text: '▼', onClick: () => this.onMoveCommandDown(), tooltip: getString('STR_TITLE_EDITOR_ACTION_MOVE_UP_TIP') },

                        { name: 'btn-replay', type: "button", x: 8 + (0 * 18), y: 270, width: 18, height: 16, image: SPR_G2_TITLE_RESTART, onClick: () => this.onReplay(), tooltip: getString('STR_TITLE_EDITOR_ACTION_REPLAY_TIP'), border: true },
                        { name: 'btn-stop', type: "button", x: 8 + (1 * 18), y: 270, width: 18, height: 16, image: SPR_G2_TITLE_STOP, onClick: () => this.onStop(), tooltip: getString('STR_TITLE_EDITOR_ACTION_STOP_TIP'), border: true },
                        { name: 'btn-play', type: "button", x: 8 + (2 * 18), y: 270, width: 18, height: 16, image: SPR_G2_TITLE_PLAY, onClick: () => this.onPlay(), tooltip: getString('STR_TITLE_EDITOR_ACTION_PLAY_TIP'), border: true },
                        { name: 'btn-skip', type: "button", x: 8 + (3 * 18), y: 270, width: 18, height: 16, image: SPR_G2_TITLE_SKIP, onClick: () => this.onSkip(), tooltip: getString('STR_TITLE_EDITOR_ACTION_SKIP_TIP'), border: true },

                        { name: "list", type: "listview", x: 89, y: 48, width: 320, height: 270, scrollbars: "vertical", isStriped: true, canSelect: true, columns: [{ width: 12 }, { width: 80 }, {}], onClick: () => this.onCommandSelect() }
                    ]
                }
            ]
        });
        if (!this.window) {
            throw new Error();
        }

        this.refreshSequences();
        this.onTabChange();
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
                this.onStop();
                this.window.minWidth = 320;
                this.window.maxWidth = 320;
                this.window.minHeight = 127;
                this.window.maxHeight = 127;
                this.refreshSequences();
                break;
            case TitleEditorWindow.tabParks:
                this.onStop();
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
        this.onUpdate();
    }

    onClose() {
        this.onStop();
    }

    onUpdate() {
        this.performLayout();
        this.refreshPlayerButtons();
    }

    static showNamePrompt(titleStringId: string, initialValue: string, callback: (name: string) => void) {
        return showInputBox(getString(titleStringId), getString('STR_TITLE_EDITOR_ENTER_NAME_FOR_SEQUENCE'), initialValue, callback);
    }

    onSequenceChange(index: number) {
        this.setSelectedTitleSequence(index);
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
            this.showDeleteConfirmWindow('STR_DELETE_SEQUENCE', titleSequence.name, () => {
                titleSequence.delete();
                this.refreshSequences();
            });
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
            this.showDeleteConfirmWindow('STR_DELETE_PARK', park.fileName, () => {
                park.delete();
                this.refreshParks();
            });
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
        const park = this.getSelectedPark();
        if (park) {
            // If we are in title screen, we need to re-open the window and restore its state
            const isInGame = context.mode === 'normal';
            const lastX = this.window.x;
            const lastY = this.window.y;
            const lastWidth = this.window.width;
            const lastHeight = this.window.height;

            park.load();

            if (!isInGame) {
                const newInstance = TitleEditorWindow.getOrOpen(TitleEditorWindow.tabParks);
                const newWindow = newInstance.window;
                newWindow.x = lastX;
                newWindow.y = lastY;
                newWindow.width = lastWidth;
                newWindow.height = lastHeight;
            }
        }
    }

    onParkSelect() {
        this.refreshParkButtons();
    }

    onInsertCommand() {
        this.onStop();
        this.openCommandWindow(null, command => {
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
        this.onStop();
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence) {
            const selectedIndex = this.getSelectedCommandIndex();
            if (selectedIndex !== undefined) {
                const pos = {
                    x: this.window.x + (this.window.width / 2),
                    y: this.window.y + (this.window.height / 2)
                };
                const command = titleSequence.commands[selectedIndex];
                this.openCommandWindow(command, command => {
                    const commands = titleSequence.commands;
                    commands[selectedIndex] = command;
                    titleSequence.commands = commands;
                    this.refreshCommands();
                });
            }
        }
    }

    openCommandWindow(command: TitleSequenceCommand | null, callback: CommandWindowCallback) {
        const pos = {
            x: this.window.x + (this.window.width / 2),
            y: this.window.y + (this.window.height / 2)
        };
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence) {
            const parks = titleSequence.parks.map(x => x.fileName);
            return CommandEditorWindow.getOrOpen(pos, parks, command, callback);
        }
        return undefined;
    }

    onDeleteCommand() {
        this.onStop();
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence) {
            const listView = this.window.findWidget<ListViewWidget>('list');
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
        this.onStop();
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

    onReplay() {
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence && titleSequence.commands.length !== 0) {
            titleSequence.seek(0);
        }
    }

    onPlay() {
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence) {
            titleSequence.play()
        }
    }

    onStop() {
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence) {
            titleSequence.stop()
        }
    }

    onSkip() {
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence && titleSequence.position != null) {
            let nextPosition = titleSequence.position + 1;
            if (nextPosition >= titleSequence.commands.length) {
                nextPosition = 0;
            }
            if (nextPosition < titleSequence.commands.length) {
                titleSequence.seek(nextPosition)
            }
        }
    }

    onSkipTo() {
        const titleSequence = this.getSelectedTitleSequence();
        if (titleSequence) {
            let nextPosition = this.getSelectedCommandIndex();
            if (nextPosition && nextPosition < titleSequence.commands.length) {
                titleSequence.seek(nextPosition)
            }
        }
    }

    getSelectedCommandIndex() {
        const listView = this.window.findWidget<ListViewWidget>('list');
        if (listView) {
            return listView.selectedCell?.row;
        }
        return undefined;
    }

    setSelectedCommandIndex(index: number) {
        const listView = this.window.findWidget<ListViewWidget>('list');
        if (listView) {
            listView.selectedCell = { row: index, column: 0 };
        }
    }

    refreshSequences(): void {
        this.titleSequences = titleSequenceManager.titleSequences;
        const seqDropdown = this.window.findWidget<DropdownWidget>('dropdown-sequence');
        if (seqDropdown) {
            seqDropdown.items = this.titleSequences.map(x => x.name);
        }

        if (this.currentSequence === undefined && TitleEditorWindow.lastSequence) {
            this.setSelectedTitleSequence(TitleEditorWindow.lastSequence);
        }

        if (this.currentSequence === undefined || this.currentSequence >= this.titleSequences.length) {
            this.setSelectedTitleSequence(0);
        } else {
            this.setSelectedTitleSequence(this.currentSequence);
        }
    }

    refreshSelectedSequence() {
        const titleSequence = this.getSelectedTitleSequence();
        TitleEditorWindow.lastSequence = titleSequence?.name;

        const deleteButton = this.window.findWidget<ButtonWidget>('btn-delete');
        if (deleteButton) {
            deleteButton.isDisabled = titleSequence?.isReadOnly ?? true;
        }

        const renameButton = this.window.findWidget<ButtonWidget>('btn-rename');
        if (renameButton) {
            renameButton.isDisabled = titleSequence?.isReadOnly ?? true;
        }

        const seqDropdown = this.window.findWidget<DropdownWidget>('dropdown-sequence');
        if (seqDropdown) {
            seqDropdown.selectedIndex = this.currentSequence;
        }
    }

    getIndexForTitleSequence(name: string) {
        for (let i = 0; i < this.titleSequences.length; i++) {
            if (this.titleSequences[i].name === name) {
                return i;
            }
        }
        return undefined;
    }

    setSelectedTitleSequence(nameOrIndex: string | number) {
        let index = typeof nameOrIndex === 'string' ?
            this.getIndexForTitleSequence(nameOrIndex) :
            nameOrIndex;

        this.currentSequence = index === undefined || index >= this.titleSequences.length ?
            undefined : index;

        this.refreshSelectedSequence();
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
            const listView = this.window.findWidget<ListViewWidget>('list');
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

        const listView = this.window.findWidget<ListViewWidget>('list');
        if (listView) {
            if (titleSequence) {
                listView.items = titleSequence.parks.map(x => x.fileName);
            } else {
                listView.items = [];
            }
        }

        this.refreshParkButtons();
    }

    refreshParkButtons() {
        const titleSequence = this.getSelectedTitleSequence();
        const parkSelected = this.getSelectedPark() != null;
        const isReadOnly = !titleSequence || titleSequence.isReadOnly;

        const addButton = this.window.findWidget<ButtonWidget>('btn-add');
        const renameButton = this.window.findWidget<ButtonWidget>('btn-rename');
        const removeButton = this.window.findWidget<ButtonWidget>('btn-remove');
        const loadButton = this.window.findWidget<ButtonWidget>('btn-load');

        if (addButton) {
            addButton.isDisabled = isReadOnly
        }

        if (removeButton) {
            removeButton.isDisabled = isReadOnly || !parkSelected;
        }

        if (renameButton) {
            renameButton.isDisabled = isReadOnly || !parkSelected;
        }

        if (loadButton) {
            loadButton.isDisabled = !parkSelected;
        }
    }

    private static getEntityText(id: number) {
        const entity = map.getEntity(id);
        if (entity) {
            switch (entity.type) {
                case 'balloon':
                    return 'Balloon';
                case 'car':
                    {
                        const rideId = (<Car>entity).ride;
                        const ride = map.getRide(rideId);
                        if (ride) {
                            return `Car (${ride.name})`;
                        } else {
                            return 'Car';
                        }
                    }
                case 'duck':
                    return 'Duck';
                case 'litter':
                    return 'Litter';
                case 'peep':
                    return (<Peep>entity).name;
                default:
                    return entity.type;
            }
        } else {
            return '<unknown>';
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
                return cmd.id === null ? "<none>" : TitleEditorWindow.getEntityText(cmd.id);
            case 'speed':
                if (cmd.speed >= 1 && cmd.speed <= speedNames.length) {
                    return getString(speedNames[cmd.speed - 1]);
                }
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
        const playingPosition = titleSequence?.position || null;

        const listView = this.window.findWidget<ListViewWidget>('list');
        if (listView) {
            if (titleSequence) {
                listView.items = titleSequence.commands.map((x, i) => {
                    const descriptor = getCommandDescriptor(x.type);
                    if (descriptor) {
                        const arg = TitleEditorWindow.getCommandArgument(titleSequence.parks, x);

                        if (playingPosition === i) {
                            const prefix = '{MEDIUMFONT}{OUTLINE}{WHITE}';
                            return [' ▶', prefix + getString(descriptor.name), prefix + arg];
                        } else {
                            return ['', getString(descriptor.name), arg];
                        }
                    } else {
                        return ['', 'Unknown', ''];
                    }
                });
            } else {
                listView.items = [];
            }
        }

        this.refreshCommandButtons();
        this.currentRenderedPosition = playingPosition;
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
            skipToButton.isDisabled = selectedIndex === undefined || titleSequence?.isPlaying !== true;
        }

        if (moveUpButton) {
            moveUpButton.isDisabled = isReadOnly || selectedIndex === undefined || selectedIndex <= 0;
        }

        if (moveDownButton) {
            moveDownButton.isDisabled = isReadOnly || selectedIndex === undefined || selectedIndex >= numCommands - 1;
        }
    }

    refreshPlayerButtons() {
        const replayButton = this.window.findWidget<ButtonWidget>('btn-replay');
        const playButton = this.window.findWidget<ButtonWidget>('btn-play');
        const stopButton = this.window.findWidget<ButtonWidget>('btn-stop');
        const skipButton = this.window.findWidget<ButtonWidget>('btn-skip');

        const titleSequence = this.getSelectedTitleSequence();
        const isPlaying = titleSequence?.isPlaying == true;
        const position = titleSequence?.position;
        if (position !== this.currentRenderedPosition) {
            this.refreshCommands();
        }

        if (playButton) {
            playButton.isDisabled = isPlaying;
        }
        for (const btn of [replayButton, stopButton, skipButton]) {
            if (btn) {
                btn.isDisabled = !isPlaying;
            }
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

    private showDeleteConfirmWindow(title: string, subject: string, callback: () => void) {
        const text = context.formatString(getString('STR_DELETE_CONFIRM_TEXT'), subject);

        const width = 200;
        const height = 100;

        let w: Window;
        const yesClick = () => {
            w.close();
            callback();
        };
        const cancelClick = () => {
            w.close();
        };
        w = ui.openWindow({
            classification: 'title-sequence-confirm',
            title: getString(title),
            x: (ui.width - width) / 2,
            y: (ui.height - height) / 2,
            width: width,
            height: height,
            colours: [26 | 0x80, 26 | 0x80],
            widgets: [
                { type: 'label', x: 10, y: 42, width: width - 20, height: 50, textAlign: 'centred', text: text },
                { type: 'button', x: 10, y: height - 20, width: 85, height: 14, onClick: yesClick, text: getString('STR_YES') },
                { type: 'button', x: width - 95, y: height - 20, width: 85, height: 14, onClick: cancelClick, text: getString('STR_CANCEL') }
            ]
        });
    }
}
