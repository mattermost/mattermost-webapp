export type AppsState = {
    bindings: AppBinding[];
};

export type AppBinding = {
    app_id: string;
    location_id?: string;
    icon?: string;

    // Label is the (usually short) primary text to display at the location.
    // - For LocationPostMenu is the menu item text.
    // - For LocationChannelHeader is the dropdown text.
    // - For LocationCommand is the name of the command
    label: string;

    // Hint is the secondary text to display
    // - LocationPostMenu: not used
    // - LocationChannelHeader: tooltip
    // - LocationCommand: the "Hint" line
    hint?: string;

    // Description is the (optional) extended help text, used in modals and autocomplete
    description?: string;

    role_id?: string;
    depends_on_team?: boolean;
    depends_on_channel?: boolean;
    depends_on_user?: boolean;
    depends_on_post?: boolean;

    // A Binding is either to a Call, or is a "container" for other locations -
    // i.e. menu sub-items or subcommands.
    call?: AppCall;
    bindings?: AppBinding[];
};

export type AppCallValues = {
    [name: string]: string;
 }

export type AppCall = {
    url: string;
    context: AppContext;
    values?: AppCallValues;
    as_modal?: boolean;
    raw_command?: string;
    from?: AppBinding[];
}

export type AppCallResponseType = string;

export const AppCallResponseTypes: {[name: string]: AppCallResponseType} = {
    OK: 'ok',
    ERROR: 'error',
    MODAL: 'modal',
    NAVIGATE: 'navigate',
    CALL: 'call',
    COMMAND: 'command',
};

export type AppCallResponse<Res = {}> = {
    type: AppCallResponseType;
    markdown?: string;
    data?: Res;
    error?: string;
    url?: string;
    use_external_browser?: boolean;
    call?: AppCall;
}

export type AppContext = {
    app_id: string;
    acting_user_id?: string;
    user_id?: string;
    channel_id?: string;
    team_id?: string;
    post_id?: string;
    root_id?: string;
    props?: AppContextProps;
}

export type AppContextProps = {
    [name: string]: string;
}

export type AppExpandLevel = string;

export const AppExpandLevels: {[name: string]: AppExpandLevel} = {
    EXPAND_ALL: 'All',
    EXPAND_SUMMARY: 'Summary',
};

export type AppExpand = {
    app?: AppExpandLevel;
    acting_user?: AppExpandLevel;
    channel?: AppExpandLevel;
    config?: AppExpandLevel;
    mentioned?: AppExpandLevel;
    parent_post?: AppExpandLevel;
    post?: AppExpandLevel;
    root_post?: AppExpandLevel;
    team?: AppExpandLevel;
    user?: AppExpandLevel;
}

export type AppForm = {
    title?: string;
    header?: string;
    footer?: string;
    icon?: string;
    fields: AppField[];
    depends_on?: string[];
};

export type AppSelectOption = {
    label: string;
    value: string;
    icon_data?: string;
};

export type AppFieldType = string;

export const AppFieldTypes: {[name: string]: AppFieldType} = {
    TEXT: 'text',
    STATIC_SELECT: 'static_select',
    DYNAMIC_SELECT: 'dynamic_select',
    BOOL: 'bool',
    USER: 'user',
    CHANNEL: 'channel',
}

// This should go in mattermost-redux
export type AppField = {
    // Name is the name of the JSON field to use.
    name: string;
    type: AppFieldType;
    is_required?: boolean;

    // Present (default) value of the field
    value?: string;

    description: string;

    // Autocomplete name should be set to either the name of the --flag for
    // named fields, or to $X for positional arguments, where X is 1-based
    // number.
    autocomplete_label?: string;
    hint?: string;
    positional?: boolean;

    modal_label?: string;

    // Select props
    refresh_on_change_to?: string[];
    source_url?: string;
    options?: AppSelectOption[];

    // Text props
    subtype?: string;
    min_length?: number;
    max_length?: number;
}

export type AppFunction = {
    form?: AppForm;
    expand?: AppExpand;
};

export type AppFormMetadataResponse = AppCallResponse<AppFunction>;

const SAMPLE_APP_FORM_METADATA_RESPONSE: AppFormMetadataResponse = {
    type: 'ok',
    data: {
        "form": {
            "title": "Message to user",
            "header": "Message modal form header",
            "footer": "Message modal form footer",
            "fields": [
                {
                    "name": "userID",
                    "type": "user",
                    "description": "User to send the message to",
                    "autocomplete_label": "user",
                    "hint": "enter user ID or @user",
                    "modal_label": "User"
                },
                {
                    "name": "message",
                    "type": "text",
                    "is_required": true,
                    "description": "Message that will be sent to the user",
                    "autocomplete_label": "$1",
                    "hint": "Anything you want to say",
                    "modal_label": "Message to send",
                    "min_length": 2,
                    "max_length": 1024
                }
            ]
        },
        "expand": {
            "app": "",
            "acting_user": ""
        }
    }
}
