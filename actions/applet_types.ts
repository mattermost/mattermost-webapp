export type AppletBinding = {
	// For use by Mattermost only, not for apps
    app_id: string;

    location_id?: string;

	// For PostMenu, ChannelHeader locations specifies the icon.
    icon?: string;

	// Name is the (usually short) primary text to display at the location.
	// - For LocationPostMenu is the menu item text.
	// - For LocationChannelHeader is the dropdown text.
	// - For LocationCommand is the name of the command
    name: string;

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
	call?: AppletCall;
    bindings?: AppletBinding[];

    func?: AppletFunction;
};

export type AppletCall = {
    url: string;
	context: AppletContext;
	values?: {[name: string]: string};
	as_modal?: boolean;
	raw_command?: string;
}

export type AppletCallResponseType = string;

export const AppletCallResponseTypes: {[name: string]: AppletCallResponseType} = {
    CALL: 'call',
	MODAL: 'modal',
    OK: 'ok',
	NAVIGATE: 'navigate',
    ERROR: 'error',
};

export type AppletCallResponse<Res={}> = {
	type: AppletCallResponseType;

	markdown?: string;
	data?: Res;

	error?: string;

	url?: string;
	use_external_browser?: boolean;

	call?: AppletCall;
}

export type AppletContext = {
	app_id: string;
	acting_user_id: string;
	user_id?: string;
	team_id?: string;
	channel_id: string;
	post_id?: string;
	root_post_id?: string;
    props?: {[name: string]: string};
};

export type AppletExpandLevel = string;

const AppletExpandLevels: {[name: string]: AppletExpandLevel} = {
	EXPAND_ALL: 'All',
	EXPAND_SUMMARY: 'Summary',
};

export type AppletExpand = {
	app?: AppletExpandLevel;
	acting_user?: AppletExpandLevel;
	channel?: AppletExpandLevel;
	config?: AppletExpandLevel;
	mentioned?: AppletExpandLevel;
	parent_post?: AppletExpandLevel;
	post?: AppletExpandLevel;
	root_post?: AppletExpandLevel;
	team?: AppletExpandLevel;
	user?: AppletExpandLevel;
}

export type AppletForm = {
    title?: string;
    header?: string;
    footer?: string;
    icon?: string;
    fields: AppletField[];
    depends_on?: string[];
};

export type AppletSelectOption = {
	label: string;
    value: string;
    icon_data?: string;
};

export type AppletFieldType = string;

export const AppletFieldTypes: {[name: string]: AppletFieldType} = {
    TEXT: 'text',
	STATIC_SELECT: 'static_select',
	DYNAMIC_SELECT: 'dynamic_select',
	BOOL: 'bool',
	USER: 'user',
	CHANNEL: 'channel',
}

// This should go in mattermost-redux
export type AppletField = {
	// Name is the name of the JSON field to use.
    name: string;
	type: AppletFieldType;
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
	options?: AppletSelectOption[];

	// Text props
    subtype?: string;
	min_length?: number;
	max_length?: number;
}

export type AppletFunction = {
    form?: AppletForm;
    expand?: AppletExpand;
};

export type AppletFormMetadataResponse = AppletCallResponse<AppletFunction>;

const SAMPLE_APPLET_FORM_METADATA_RESPONSE: AppletFormMetadataResponse = {
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
