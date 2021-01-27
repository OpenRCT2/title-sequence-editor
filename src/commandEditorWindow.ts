const speedNames = [
    'STR_SPEED_NORMAL',
    'STR_SPEED_QUICK',
    'STR_SPEED_FAST',
    'STR_SPEED_TURBO'
];

type CommandId =
    'load' |
    'loadsc' |
    'location' |
    'rotate' |
    'zoom' |
    'speed' |
    'follow' |
    'wait' |
    'restart' |
    'end';

interface CommandDesc {
    id: CommandId;
    name: string;
    desc: string;
}

const CommandDescriptors: CommandDesc[] = [
    { id: 'load', name: 'STR_TITLE_EDITOR_ACTION_LOAD_SAVE', desc: 'STR_TITLE_EDITOR_ARGUMENT_SAVEFILE' },
    { id: 'loadsc', name: 'STR_TITLE_EDITOR_ACTION_LOAD_SCENARIO', desc: 'STR_TITLE_EDITOR_ARGUMENT_SCENARIO' },
    { id: 'location', name: 'STR_TITLE_EDITOR_COMMAND_TYPE_LOCATION', desc: 'STR_TITLE_EDITOR_ARGUMENT_COORDINATES' },
    { id: 'rotate', name: 'STR_TITLE_EDITOR_COMMAND_TYPE_ROTATE', desc: 'STR_TITLE_EDITOR_ARGUMENT_ROTATIONS' },
    { id: 'zoom', name: 'STR_TITLE_EDITOR_COMMAND_TYPE_ZOOM', desc: 'STR_TITLE_EDITOR_ARGUMENT_ZOOM_LEVEL' },
    { id: 'speed', name: 'STR_TITLE_EDITOR_COMMAND_TYPE_SPEED', desc: 'STR_TITLE_EDITOR_ARGUMENT_SPEED' },
    { id: 'follow', name: 'STR_TITLE_EDITOR_COMMAND_TYPE_FOLLOW', desc: '' },
    { id: 'wait', name: 'STR_TITLE_EDITOR_COMMAND_TYPE_WAIT', desc: 'STR_TITLE_EDITOR_ARGUMENT_WAIT_SECONDS' },
    { id: 'restart', name: 'STR_TITLE_EDITOR_RESTART', desc: '' },
    { id: 'end', name: 'STR_TITLE_EDITOR_END', desc: '' },
];

function getCommandDescriptor(id: CommandId) {
    for (const d of CommandDescriptors) {
        if (d.id === id) {
            return d;
        }
    }
    throw new Error(`command id (${id}) not present in descriptor table`);
}

type CommandWindowCallback = (command: TitleSequenceCommand) => void;

class CommandEditorWindow {

    static readonly className = 'title-sequence-editor-command';
    static readonly selectEntityToolName = 'title-sequence-editor-select-entity';

    window: Window;
    parks: string[];
    callback: CommandWindowCallback;
    entityId: number | null = null;

    constructor(pos: ScreenCoordsXY, parks: string[], command: TitleSequenceCommand | null, callback: CommandWindowCallback) {
        const commands = CommandDescriptors.map(x => getString(x.name));
        const width = 200;
        const height = 120;
        this.window = ui.openWindow({
            classification: CommandEditorWindow.className,
            title: getString('STR_TITLE_COMMAND_EDITOR_TITLE'),
            colours: [1, 15, 15],
            x: pos.x - (width / 2),
            y: pos.y - (height / 2),
            width: width,
            height: height,
            widgets: [
                <LabelWidget>{ type: "label", x: 16, y: 18, width: 168, height: 12, text: getString('STR_TITLE_COMMAND_EDITOR_COMMAND_LABEL') },
                <DropdownWidget>{ type: "dropdown", x: 16, y: 32, width: 168, height: 12, items: commands, selectedIndex: 0, onChange: index => this.onCommandChange(), name: 'dropdown-type' },
                <LabelWidget>{ type: "label", x: 16, y: 56, width: 168, height: 12, name: 'label-desc' },

                <TextBoxWidget>{ type: "textbox", x: 16, y: 70, width: 168, height: 12, name: 'textbox-full', maxLength: 6 },
                <TextBoxWidget>{ type: "textbox", x: 16, y: 70, width: 81, height: 12, name: 'textbox-x', maxLength: 3 },
                <TextBoxWidget>{ type: "textbox", x: 103, y: 70, width: 81, height: 12, name: 'textbox-y', maxLength: 3 },

                <DropdownWidget>{ type: "dropdown", x: 16, y: 70, width: 168, height: 12, items: [], selectedIndex: 0, name: 'dropdown-arg' },

                <ButtonWidget>{ type: "button", x: 103, y: 56, width: 81, height: 12, onClick: () => this.onGetClick(), text: getString('STR_TITLE_COMMAND_EDITOR_ACTION_GET_LOCATION'), name: 'btn-get-location' },
                <ButtonWidget>{ type: "button", x: 112, y: 56, width: 72, height: 12, onClick: function () { }, text: getString('STR_TITLE_COMMAND_EDITOR_ACTION_SELECT_SCENARIO'), name: 'btn-select-scenario' },

                <ButtonWidget>{ type: "button", x: 16, y: 56, width: 168, height: 12, onClick: () => this.onSelectEntity(), text: getString('STR_TITLE_COMMAND_EDITOR_SELECT_SPRITE'), name: 'btn-select-entity' },

                <ButtonWidget>{ type: "button", x: 10, y: 99, width: 71, height: 14, onClick: () => this.onOkClick(), text: getString('STR_OK') },
                <ButtonWidget>{ type: "button", x: 120, y: 99, width: 71, height: 14, onClick: () => this.onCancelClick(), text: getString('STR_CANCEL') },
            ]
        });
        if (!this.window) {
            throw new Error();
        }
        this.parks = parks;
        this.callback = callback;

        if (command) {
            this.setCommand(command);
        } else {
            const id = this.getCommandId();
            if (id) {
                this.initialiseWidgetsForCommand(id);
            }
        }
    }

    private onOkClick() {
        const command = this.getCommand();
        this.window.close();
        if (command) {
            this.callback(command);
        }
    }

    private onCancelClick() {
        this.window.close();
    }

    private onGetClick() {
        const id = this.getCommandId();
        if (id !== undefined) {
            const widgets = this.getWidgets();
            const command = getCommandDescriptor(id);
            if (command.id === 'location') {
                var pos = ui.mainViewport.getCentrePosition();
                pos.x = Math.round(pos.x / 32);
                pos.y = Math.round(pos.y / 32);
                widgets.xTextBox.text = pos.x.toString();
                widgets.yTextBox.text = pos.y.toString();
            } else if (command.id === 'zoom') {
                widgets.fullTextBox.text = ui.mainViewport.zoom.toString();
            }
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

    private onSelectEntity() {
        const toolId = CommandEditorWindow.selectEntityToolName;
        if (ui.tool?.id === toolId) {
            ui.tool.cancel();
        } else {
            ui.activateTool({
                id: toolId,
                cursor: 'cross_hair',
                onStart: () => {
                    const widgets = this.getWidgets();
                    widgets.selectEntityButton.isPressed = true;
                },
                onDown: e => {
                    const widgets = this.getWidgets();
                    if (e.entityId) {
                        this.entityId = e.entityId;
                        widgets.fullTextBox.text = CommandEditorWindow.getEntityText(e.entityId);
                        ui.tool?.cancel();
                    }
                },
                onFinish: () => {
                    const widgets = this.getWidgets();
                    widgets.selectEntityButton.isPressed = false;
                }
            });
        }
    }

    onCommandChange() {
        const id = this.getCommandId();
        if (id !== undefined) {
            this.initialiseWidgetsForCommand(id);
        }
    }

    getWidgets() {
        const w = this.window;
        return {
            typeDropdown: w.findWidget<DropdownWidget>('dropdown-type'),
            descLabel: w.findWidget<LabelWidget>('label-desc'),
            getLocationButton: w.findWidget<ButtonWidget>('btn-get-location'),
            selectScenarioButton: w.findWidget<ButtonWidget>('btn-select-scenario'),
            selectEntityButton: w.findWidget<ButtonWidget>('btn-select-entity'),
            argumentDropdown: w.findWidget<DropdownWidget>('dropdown-arg'),
            xTextBox: w.findWidget<TextBoxWidget>('textbox-x'),
            yTextBox: w.findWidget<TextBoxWidget>('textbox-y'),
            fullTextBox: w.findWidget<TextBoxWidget>('textbox-full')
        };
    }

    initialiseWidgetsForCommand(id: CommandId) {
        const widgets = this.getWidgets();
        const command = getCommandDescriptor(id);

        if (widgets.typeDropdown) {
            widgets.typeDropdown.selectedIndex = CommandDescriptors.indexOf(command);
        }

        if (widgets.descLabel) {
            widgets.descLabel.text = command.desc == '' ? '' : getString(command.desc);
        }

        switch (command.id) {
            case 'load':
                widgets.argumentDropdown.items = this.parks;
                widgets.argumentDropdown.selectedIndex = 0;
                break;
            case 'loadsc':
                widgets.fullTextBox.text = getString('STR_TITLE_COMMAND_EDITOR_NO_SCENARIO_SELECTED');
                widgets.fullTextBox.isDisabled = true;
                break;
            case 'location':
                widgets.xTextBox.text = '0';
                widgets.yTextBox.text = '0';
                break;
            case 'rotate':
                widgets.fullTextBox.text = '1';
                widgets.fullTextBox.maxLength = 2;
                widgets.fullTextBox.isDisabled = false;
                break;
            case 'zoom':
                widgets.fullTextBox.text = '0';
                widgets.fullTextBox.maxLength = 2;
                widgets.fullTextBox.isDisabled = false;
                break;
            case 'speed':
                widgets.argumentDropdown.items = speedNames.map(x => getString(x));
                widgets.argumentDropdown.selectedIndex = 0;
                break;
            case 'follow':
                widgets.fullTextBox.text = '<none>';
                widgets.fullTextBox.isDisabled = true;
                break;
            case 'wait':
                widgets.fullTextBox.text = '10000';
                widgets.fullTextBox.maxLength = 6;
                widgets.fullTextBox.isDisabled = false;
                break;
        }

        var setVisibility = (widget: Widget, commands: CommandId[]) => {
            if (widget) {
                widget.isVisible = false;
                if (commands.indexOf(command.id) != -1) {
                    widget.isVisible = true;
                }
            }
        };

        setVisibility(widgets.argumentDropdown, ['load', 'speed']);
        setVisibility(widgets.getLocationButton, ['location', 'zoom']);
        setVisibility(widgets.selectScenarioButton, ['loadsc']);
        setVisibility(widgets.selectEntityButton, ['follow']);
        setVisibility(widgets.xTextBox, ['location']);
        setVisibility(widgets.yTextBox, ['location']);
        setVisibility(widgets.fullTextBox, ['loadsc', 'rotate', 'zoom', 'follow', 'wait']);
    }

    getCommandId() {
        const typeDropdown = this.window.findWidget<DropdownWidget>('dropdown-type');
        if (typeDropdown) {
            const index = typeDropdown.selectedIndex;
            if (index >= 0 && index < CommandDescriptors.length) {
                return CommandDescriptors[index].id;
            }
        }
        return undefined;
    }

    getCommand() {
        const widgets = this.getWidgets();
        const id = this.getCommandId()
        switch (id) {
            case 'load':
                return {
                    type: id,
                    index: widgets.argumentDropdown.selectedIndex
                };
            case 'loadsc':
                return {
                    type: id,
                    scenario: ''
                };
            case 'location':
                return {
                    type: id,
                    x: parseInt(widgets.xTextBox.text),
                    y: parseInt(widgets.yTextBox.text)
                };
            case 'rotate':
                return {
                    type: id,
                    rotations: parseInt(widgets.fullTextBox.text)
                };
            case 'zoom':
                return {
                    type: id,
                    zoom: parseInt(widgets.fullTextBox.text)
                };
            case 'speed':
                return {
                    type: id,
                    speed: widgets.argumentDropdown.selectedIndex
                };
            case 'follow':
                return {
                    type: id,
                    id: null
                };
            case 'wait':
                return {
                    type: id,
                    duration: parseInt(widgets.fullTextBox.text)
                };
            case 'restart':
            case 'end':
                return {
                    type: id
                };
        }
        return undefined;
    }

    setCommand(command: TitleSequenceCommand) {
        this.initialiseWidgetsForCommand(command.type);
        const widgets = this.getWidgets();
        switch (command.type) {
            case 'load':
                widgets.argumentDropdown.selectedIndex = command.index;
                break;
            case 'location':
                widgets.xTextBox.text = command.x.toString();
                widgets.yTextBox.text = command.y.toString();
                break;
            case 'rotate':
                widgets.fullTextBox.text = command.rotations.toString();
                break;
            case 'zoom':
                widgets.fullTextBox.text = command.zoom.toString();
                break;
            case 'speed':
                widgets.fullTextBox.text = command.speed.toString();
                break;
            case 'follow':
                break;
            case 'wait':
                widgets.fullTextBox.text = command.duration.toString();
                break;
        }
    }

    static getOrOpen(pos: ScreenCoordsXY, parks: string[], command: TitleSequenceCommand | null, callback: CommandWindowCallback) {
        var w = ui.getWindow(CommandEditorWindow.className);
        if (w) {
            w.close();
        }
        return new CommandEditorWindow(pos, parks, command, callback);
    }
}
