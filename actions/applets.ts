// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';

import {sendEphemeralPost} from 'actions/global_actions.jsx';
import {AppletCall, AppCallResponse} from './applet_types';

export async function doAppletCall<Req = {}, Res = {}>(call: AppletCall) {
    const res = await Client4.executePluginCall(call) as AppCallResponse<Res>;

    if (res.markdown) {
        sendEphemeralPost(res.markdown, call.context.channel_id, call.context.root_post_id);
    }

    return res;
}
