// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {submitInteractiveDialog as submitInteractiveDialogRedux} from 'mattermost-redux/actions/integrations';
import {DialogSubmission} from 'mattermost-redux/types/integrations';
import {getCurrentChannelId} from 'mattermost-redux/selectors/entities/common';
import {ActionFunc, DispatchFunc, GetStateFunc} from 'mattermost-redux/types/actions';
import {AppCallResponseTypes, AppCallResponse, AppCall} from 'mattermost-redux/types/apps';

import {sendEphemeralPost} from 'actions/global_actions';
import {openInteractiveDialog} from 'plugins/interactive_dialog';
import {executeCommand} from 'actions/command';

export function doAppCall(call: AppCall): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        const res = await Client4.executeAppCall(call) as AppCallResponse<any>; // TODO use unknown and check types (may need type guards)

        switch (res.type) {
        case AppCallResponseTypes.OK:
            if (res.markdown) {
                if (!call.context.channel_id) {
                    return {data: res};
                }

                sendEphemeralPost(res.markdown, call.context.channel_id, call.context.root_id);
            }
            return {data: res};
        case AppCallResponseTypes.MODAL:
            if (!res.data) {
                return {data: res};
            }
            res.data.app_id = call.context.app_id;
            openInteractiveDialog(res.data);
            return {data: res};
        case AppCallResponseTypes.COMMAND:
            res.data.args.command = res.data.command;
            return dispatch(executeCommand(res.data.command, res.data.args));
        }

        return {data: res};
    };
}

export function submitInteractiveDialog(dialog: DialogSubmission): ActionFunc {
    return (dispatch: DispatchFunc, getState: GetStateFunc) => {
        if (!dialog.submission.app_id) {
            return dispatch(submitInteractiveDialogRedux(dialog));
        }

        // Should `from` be used here instead of getting the channelID this way?
        // This interactive dialog could have been triggered by a command run in the RHS for example.
        // The previous Call or CallResponse would contain the correct channelID
        const channelID = getCurrentChannelId(getState());
        return dispatch(doAppCall({
            url: dialog.url,
            values: dialog.submission,
            context: {
                app_id: dialog.submission.app_id,
                channel_id: channelID,
            },
        }));
    };
}
