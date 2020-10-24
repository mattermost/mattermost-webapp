// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {Client4} from 'mattermost-redux/client';

import {sendEphemeralPost} from 'actions/global_actions.jsx';

export enum CallExpandLevel {
    ExpandAll =     'All',
    ExpandSummary = 'Summary',
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
    values?: {
        data: {
            [name: string]: any;
        };
        raw?: string;
    }
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

export type CallResponse = {
	type: string;
    markdown?: string;
	data?: any;
    error?: string;
    url?: string;
	use_external_browser?: boolean;
    call?: Call;
}

export async function doPluginCall(call: Call) {
    const res = await Client4.executePluginCall(call) as CallResponse;

    if (res.markdown) {
        sendEphemeralPost(res.markdown, call.context.channel_id, call.context.root_id);
    }

    return res;
}
