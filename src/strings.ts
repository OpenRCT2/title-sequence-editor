const enGB: { [name: string]: string } = {
    'STR_TITLE_EDITOR_TITLE': 'Title Sequences',
    'STR_TITLE_SEQUENCE': 'Title Sequence:',
    'STR_TITLE_EDITOR_ACTION_CREATE': 'Create',
    'STR_TITLE_EDITOR_ACTION_CREATE_SEQUENCE_TIP': 'Create a new title sequence from scratch',
    'STR_TITLE_EDITOR_ACTION_DUPLICATE': 'Duplicate',
    'STR_TITLE_EDITOR_ACTION_DUPLICATE_SEQUENCE_TIP': 'Create a new title sequence based on the current one',
    'STR_TITLE_EDITOR_ACTION_DELETE': 'Delete',
    'STR_TITLE_EDITOR_ACTION_DELETE_SEQUENCE_TIP': 'Delete the current title sequence',
    'STR_TITLE_EDITOR_ACTION_RENAME': 'Rename',
    'STR_TITLE_EDITOR_ACTION_RENAME_SEQUENCE_TIP': 'Rename the current title sequence',
    'STR_TITLE_EDITOR_ACTION_ADD': 'Add',
    'STR_TITLE_EDITOR_ACTION_ADD_TIP': '',
    'STR_TITLE_EDITOR_ACTION_REMOVE': 'Remove',
    'STR_TITLE_EDITOR_ACTION_REMOVE_TIP': '',
    'STR_TITLE_EDITOR_ACTION_RENAME_TIP': '',
    'STR_TITLE_EDITOR_ACTION_LOAD': 'Load',
    'STR_TITLE_EDITOR_ACTION_LOAD_TIP': '',
    'STR_TITLE_EDITOR_ACTION_INSERT': 'Insert',
    'STR_TITLE_EDITOR_ACTION_EDIT': 'Edit',
    'STR_TITLE_EDITOR_ACTION_SKIP_TO': 'Skip to',
    'STR_OK': 'OK',
    'STR_CANCEL': 'Cancel',
    'STR_TITLE_COMMAND_EDITOR_SELECT_SPRITE': 'Select Sprite',
    'STR_TITLE_COMMAND_EDITOR_COMMAND_LABEL': 'Command:',
    'STR_TITLE_COMMAND_EDITOR_TITLE': 'Command Editor',
    'STR_TITLE_EDITOR_ACTION_LOAD_SAVE': 'Load Save',
    'STR_TITLE_EDITOR_ARGUMENT_SAVEFILE': 'Save to load:',
    'STR_TITLE_EDITOR_ACTION_LOAD_SCENARIO': 'Load Scenario',
    'STR_TITLE_EDITOR_ARGUMENT_SCENARIO': 'Scenario to load:',
    'STR_TITLE_EDITOR_COMMAND_TYPE_LOCATION': 'Location',
    'STR_TITLE_EDITOR_COMMAND_TYPE_ROTATE': 'Rotate',
    'STR_TITLE_EDITOR_COMMAND_TYPE_ZOOM': 'Zoom',
    'STR_TITLE_EDITOR_COMMAND_TYPE_SPEED': 'Speed',
    'STR_TITLE_EDITOR_COMMAND_TYPE_FOLLOW': 'Follow Sprite',
    'STR_TITLE_EDITOR_COMMAND_TYPE_WAIT': 'Wait',
    'STR_TITLE_EDITOR_ARGUMENT_COORDINATES': 'Coordinates:',
    'STR_TITLE_EDITOR_ARGUMENT_ROTATIONS': 'Anticlockwise rotations:',
    'STR_TITLE_EDITOR_ARGUMENT_ZOOM_LEVEL': 'Zoom level:',
    'STR_TITLE_EDITOR_ARGUMENT_SPEED': 'Speed:',
    'STR_TITLE_EDITOR_ARGUMENT_WAIT_SECONDS': 'Milliseconds to wait:',
    'STR_TITLE_EDITOR_RESTART': 'Restart',
    'STR_TITLE_EDITOR_END': 'End',
    'STR_TITLE_COMMAND_EDITOR_ACTION_GET_LOCATION': 'Get',
    'STR_TITLE_COMMAND_EDITOR_ACTION_SELECT_SCENARIO': 'Select',
    'STR_SPEED_NORMAL': 'Normal Speed',
    'STR_SPEED_QUICK': 'Quick Speed',
    'STR_SPEED_FAST': 'Fast Speed',
    'STR_SPEED_TURBO': 'Turbo Speed',
    'STR_SPEED_HYPER': 'Hyper Speed',
    'STR_TITLE_COMMAND_EDITOR_NO_SAVE_SELECTED': 'No save selected',
    'STR_TITLE_COMMAND_EDITOR_NO_SCENARIO_SELECTED': 'No scenario selected',
    'STR_TITLE_EDITOR_ENTER_NAME_FOR_SEQUENCE': 'Enter a name for the title sequence'
};

const strings: { [lang: string]: { [name: string]: string } } = {
    'en-GB': enGB
};

var getString = (name: string) => {
    let lang = context.configuration.get<string>("general.language");
    if (lang && lang in strings) {
        let localised = strings[lang];
        if (name in localised) {
            return localised[name];
        }
    }

    // Fallback to en-GB
    if (name in enGB) {
        return enGB[name];
    }

    return '<unknown>';
};
