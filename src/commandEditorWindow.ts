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
    return null;
}

class CommandEditorWindow {

    static readonly className = 'title-sequence-editor-command';

    window: Window;
    currentCommand: number;

    constructor() {
        const commands = CommandDescriptors.map(x => getString(x.name));
        this.window = ui.openWindow({
            classification: CommandEditorWindow.className,
            title: getString('STR_TITLE_COMMAND_EDITOR_TITLE'),
            colours: [1, 15, 15],
            width: 200,
            height: 120,
            widgets: [
                <LabelWidget>{ type: "label", x: 16, y: 18, width: 168, height: 12, text: getString('STR_TITLE_COMMAND_EDITOR_COMMAND_LABEL') },
                <DropdownWidget>{ type: "dropdown", x: 16, y: 32, width: 168, height: 12, items: commands, selectedIndex: 0, onChange: this.onCommandChange },
                <LabelWidget>{ type: "label", x: 16, y: 56, width: 168, height: 12, name: 'label-desc' },

                <TextBoxWidget>{ type: "textbox", x: 16, y: 70, width: 168, height: 12, name: 'textbox-full', maxLength: 6 },
                <TextBoxWidget>{ type: "textbox", x: 16, y: 70, width: 81, height: 12, name: 'textbox-x', maxLength: 4 },
                <TextBoxWidget>{ type: "textbox", x: 103, y: 70, width: 81, height: 12, name: 'textbox-y', maxLength: 4 },

                <DropdownWidget>{ type: "dropdown", x: 16, y: 70, width: 168, height: 12, items: [], selectedIndex: 0, name: 'dropdown-arg' },

                <ButtonWidget>{ type: "button", x: 103, y: 56, width: 81, height: 12, onClick: this.onGetClick, text: getString('STR_TITLE_COMMAND_EDITOR_ACTION_GET_LOCATION'), name: 'btn-get-location' },
                <ButtonWidget>{ type: "button", x: 112, y: 56, width: 72, height: 12, onClick: function () { }, text: getString('STR_TITLE_COMMAND_EDITOR_ACTION_SELECT_SCENARIO'), name: 'btn-select-scenario' },

                <ButtonWidget>{ type: "button", x: 16, y: 56, width: 168, height: 12, onClick: function () { }, text: getString('STR_TITLE_COMMAND_EDITOR_SELECT_SPRITE'), name: 'btn-select-sprite' },

                <ButtonWidget>{ type: "button", x: 10, y: 99, width: 71, height: 14, onClick: this.onOkClick, text: getString('STR_OK') },
                <ButtonWidget>{ type: "button", x: 120, y: 99, width: 71, height: 14, onClick: this.onCancelClick, text: getString('STR_CANCEL') },
            ]
        });
        if (!this.window) {
            throw new Error();
        }
        this.currentCommand = 0;
        this.onCommandChange(0);
    }

    private onOkClick() {
        this.window.close();
    }

    private onCancelClick() {
        this.window.close();
    }

    private onGetClick() {
        var command = CommandDescriptors[this.currentCommand];
        if (command.id === 'location') {
            var pos = ui.mainViewport.getCentrePosition();
            pos.x = Math.round(pos.x / 32);
            pos.y = Math.round(pos.y / 32);

            var xTextBox = this.window.findWidget<TextBoxWidget>('textbox-x');
            if (xTextBox) {
                xTextBox.text = pos.x.toString();
            }

            var yTextBox = this.window.findWidget<TextBoxWidget>('textbox-y');
            if (yTextBox) {
                yTextBox.text = pos.y.toString();
            }
        }
    }

    onCommandChange(index: number) {
        this.currentCommand = index;

        const w = this.window;
        const descLabel = w.findWidget<LabelWidget>('label-desc');
        const getLocationButton = w.findWidget<ButtonWidget>('btn-get-location');
        const selectScenarioButton = w.findWidget<ButtonWidget>('btn-select-scenario');
        const selectSpriteButton = w.findWidget<ButtonWidget>('btn-select-sprite');
        const argumentDropdown = w.findWidget<DropdownWidget>('dropdown-arg');
        const xTextBox = w.findWidget<TextBoxWidget>('textbox-x');
        const yTextBox = w.findWidget<TextBoxWidget>('textbox-y');
        const fullTextBox = w.findWidget<TextBoxWidget>('textbox-full');

        var command = CommandDescriptors[index];
        if (descLabel) {
            descLabel.text = command.desc == '' ? '' : getString(command.desc);
        }

        switch (command.id) {
            case 'load':
                if (fullTextBox) {
                    fullTextBox.text = getString('STR_TITLE_COMMAND_EDITOR_NO_SAVE_SELECTED');
                    fullTextBox.isDisabled = true;
                }
                break;
            case 'loadsc':
                if (fullTextBox) {
                    fullTextBox.text = getString('STR_TITLE_COMMAND_EDITOR_NO_SCENARIO_SELECTED');
                    fullTextBox.isDisabled = true;
                }
                break;
            case 'location':
                if (xTextBox) {
                    xTextBox.text = '0';
                    xTextBox.maxLength = 2;
                }
                if (yTextBox) {
                    yTextBox.text = '0';
                    yTextBox.maxLength = 2;
                }
                break;
            case 'rotate':
                if (fullTextBox) {
                    fullTextBox.text = '1';
                    fullTextBox.maxLength = 2;
                    fullTextBox.isDisabled = false;
                }
                break;
            case 'zoom':
                if (fullTextBox) {
                    fullTextBox.text = '0';
                    fullTextBox.maxLength = 2;
                    fullTextBox.isDisabled = false;
                }
                break;
            case 'speed':
                if (argumentDropdown) {
                    argumentDropdown.items = speedNames.map(x => getString(x));
                    argumentDropdown.selectedIndex = 0;
                }
                break;
            case 'wait':
                if (fullTextBox) {
                    fullTextBox.text = '10000';
                    fullTextBox.maxLength = 6;
                    fullTextBox.isDisabled = false;
                }
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

        setVisibility(argumentDropdown, ['speed']);
        setVisibility(getLocationButton, ['location', 'zoom']);
        setVisibility(selectScenarioButton, ['loadsc']);
        setVisibility(selectSpriteButton, ['follow']);
        setVisibility(xTextBox, ['location']);
        setVisibility(yTextBox, ['location']);
        setVisibility(fullTextBox, ['load', 'loadsc', 'rotate', 'zoom', 'wait']);
    }

    static getOrOpen() {
        var w = ui.getWindow(CommandEditorWindow.className);
        if (w) {
            w.close();
            return null;
        } else {
            return new CommandEditorWindow();
        }
    }
}
