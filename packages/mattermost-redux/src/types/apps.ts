// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// This file's contents belong to the Apps Framework feature.
// Apps Framework feature is experimental, and the contents of this file are
// susceptible to breaking changes without pushing the major version of this package.

export enum AppType {
    HTTP = 'http',
    AWSLambda = 'aws_lambda',
    Builtin = 'builtin',
}

export enum Permission {
    UserJoinedChannelNotification = 'user_joined_channel_notification',
    ActAsBot = 'act_as_bot',
    ActAsUser = 'act_as_user',
    PermissionActAsAdmin = 'act_as_admin',
    RemoteOAuth2 = 'remote_oauth2',
    RemoteWebhooks = 'remote_webhooks',
}

export enum Locations {
    PostMenu = '/post_menu',
    ChannelHeader = '/channel_header',
    Command = '/command',
    InPost = '/in_post',
}

export type AppManifest = {
    app_id: string;
    app_type: AppType;
    version?: string;
    homepage_url?: string;
    display_name: string;
    description?: string;
    requested_permissions?: Permission[];
    requested_locations?: Locations[];
    root_url?: string;
}

export type AppModalState = {
    form: AppForm;
    call: AppCallRequest;
}

export type AppsState = {
    bindings: AppBinding[];
};

export type AppBinding = {
    app_id: string;
    location?: string;
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
    form?: AppForm;
};

export type AppCallValues = {
    [name: string]: any;
};

export type AppCallType = string;

export type AppCall = {
    path: string;
    expand?: AppExpand;
    state?: any;
};

export type AppCallRequest = AppCall & {
    context: AppContext;
    values?: AppCallValues;
    raw_command?: string;
    selected_field?: string;
    query?: string;
};

export type AppCallResponseType = string;

export type AppCallResponse<Res = unknown> = {
    type: AppCallResponseType;
    markdown?: string;
    data?: Res;
    error?: string;
    navigate_to_url?: string;
    use_external_browser?: boolean;
    call?: AppCall;
    form?: AppForm;
    app_metadata?: AppMetadataForClient;
};

export type AppMetadataForClient = {
    bot_user_id: string;
    bot_username: string;
}

export type AppContext = {
    app_id: string;
    location?: string;
    acting_user_id?: string;
    user_id?: string;
    channel_id?: string;
    team_id?: string;
    post_id?: string;
    root_id?: string;
    props?: AppContextProps;
    user_agent?: string;
};

export type AppContextProps = {
    [name: string]: string;
};

export type AppExpandLevel = string;

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
};

export type AppForm = {
    title?: string;
    header?: string;
    footer?: string;
    icon?: string;
    submit_buttons?: string;
    cancel_button?: boolean;
    submit_on_cancel?: boolean;
    fields: AppField[];
    call?: AppCall;
    depends_on?: string[];
};

export type AppFormValue = string | AppSelectOption | boolean | null;
export type AppFormValues = {[name: string]: AppFormValue};

export type AppSelectOption = {
    label: string;
    value: string;
    icon_data?: string;
};

export type AppFieldType = string;

// This should go in mattermost-redux
export type AppField = {

    // Name is the name of the JSON field to use.
    name: string;
    type: AppFieldType;
    is_required?: boolean;
    readonly?: boolean;

    // Present (default) value of the field
    value?: AppFormValue;

    description?: string;

    label?: string;
    hint?: string;
    position?: number;

    modal_label?: string;

    // Select props
    refresh?: boolean;
    options?: AppSelectOption[];
    multiselect?: boolean;

    // Text props
    subtype?: string;
    min_length?: number;
    max_length?: number;
};

export type AutocompleteSuggestion = {
    suggestion: string;
    complete?: string;
    description?: string;
    hint?: string;
    iconData?: string;
}

export type AutocompleteSuggestionWithComplete = AutocompleteSuggestion & {
    complete: string;
}

export type AutocompleteElement = AppField;
export type AutocompleteStaticSelect = AutocompleteElement & {
    options: AppSelectOption[];
};

export type AutocompleteDynamicSelect = AutocompleteElement;

export type AutocompleteUserSelect = AutocompleteElement;

export type AutocompleteChannelSelect = AutocompleteElement;

export type FormResponseData = {
    errors?: {
        [field: string]: string;
    };
}

export type AppLookupResponse = {
    items: AppSelectOption[];
}
