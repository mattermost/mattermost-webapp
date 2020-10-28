// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {submitInteractiveDialog as submitInteractiveDialogRedux} from 'mattermost-redux/actions/integrations';
import {DialogSubmission} from 'mattermost-redux/types/integrations';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';

import {sendEphemeralPost} from 'actions/global_actions.jsx';
import {openInteractiveDialog} from 'plugins/interactive_dialog';

export type CallExpandLevel = string;
export type CallResponseType = string;

export const CallResponseTypes: {[name: string]: CallResponseType} = {
    CALL: 'call',
	MODAL: 'modal',
    OK: 'ok',
	NAVIGATE: 'navigate',
    ERROR: 'error',
};

export const CallExpandLevels: {[name: string]: CallExpandLevel} = {
    EXPAND_ALL: 'All',
    EXPAND_SUMMARY: 'Summary',
};

export type DialogElement = {};

export type InteractiveDialogConfig = {
    trigger_id: string;
    url: string;
    app_id: string;
    dialog: {
        callback_id: string;
        title: string;
        introduction_text: string;
        elements: DialogElement[];
        submit_label: string;
        notify_on_cancel: boolean;
        state: string;
    };
}

export type CallValues = {
    data: {
        [name: string]: string;
    };
    raw?: string;
}

export type Call = {
    form_url: string;
    context: {
        app_id: string;
        channel_id?: string;
        team_id?: string;
        post_id?: string;
        root_id?: string;
    };
    from: any[];
    // from: PluginLocation[];
    values?: CallValues;
    expand?: {
        app?: CallExpandLevel;
        acting_user?: CallExpandLevel;
        channel?: CallExpandLevel;
        config?: CallExpandLevel;
        mentioned?: CallExpandLevel;
        parent_post?: CallExpandLevel;
        post?: CallExpandLevel;
        root_post?: CallExpandLevel;
        team?: CallExpandLevel;
        user?: CallExpandLevel;
    };
};

export type CallResponse<T> = {
	type: CallResponseType;
    markdown?: string;
	data?: T;
    error?: string;
    url?: string;
	use_external_browser?: boolean;
    call?: Call;
}

export async function doPluginCall<T>(call: Call) {
    const res = await Client4.executePluginCall(call) as CallResponse<T>;

    if (res.markdown) {
        sendEphemeralPost(res.markdown, call.context.channel_id, call.context.root_id);
    }

    if (res.type === CallResponseTypes.MODAL) {
        res.data.app_id = call.context.app_id;
        return openInteractiveDialog(res.data);
    }

    return res;
}

export function submitInteractiveDialog(dialog: DialogSubmission) {
    return (dispatch, getState) => {
        if (!dialog.app_id) {
            return dispatch(submitInteractiveDialogRedux(dialog));
        }

        // Should `from` be used here instead of getting the channelID this way?
        // This interactive dialog could have been triggered by a command run in the RHS for example.
        // The previous Call or CallResponse would contain the correct channelID
        const channelID = getCurrentChannelId(getState());
        return doPluginCall({
            form_url: dialog.url,
            data: dialog,
            context: {
                app_id: dialog.app_id,
                channel_id: channelID,
            },
            from: [],
        });
    };
}
