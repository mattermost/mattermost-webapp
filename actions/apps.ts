// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {Action, ActionFunc, DispatchFunc} from 'mattermost-redux/types/actions';
import {AppCallResponseTypes, AppCallResponse, AppCall, AppForm} from 'mattermost-redux/types/apps';

import {sendEphemeralPost} from 'actions/global_actions';
import {executeCommand} from 'actions/command';
import {openModal} from 'actions/views/modals';

import AppsModal from 'components/apps_modal';

import {ModalIdentifiers} from 'utils/constants';

const ephemeral = (text: string, call?: AppCall) => sendEphemeralPost(text, (call && call.context.channel_id) || '', call && call.context.root_id);
const ephemeralJSON = (obj: unknown, call?: AppCall) => ephemeral('```json\n' + JSON.stringify(obj, null, 2) + '\n```', call);

export function doAppCall(call: AppCall): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        const res = await Client4.executeAppCall(call) as AppCallResponse<any>; // TODO use unknown and check types (may need type guards)

        if (res.error) {
            ephemeral(res.error, call);
            throw new Error(res.error);
        }

        switch (res.type || AppCallResponseTypes.OK) {
        case AppCallResponseTypes.OK:
            if (res.markdown) {
                if (!call.context.channel_id) {
                    return {data: res};
                }

                ephemeral(res.markdown, call);
            }
            return {data: res};
        case AppCallResponseTypes.FORM:
            if (!res.form) {
                ephemeralJSON(res, call);
                return {data: false};
            }

            dispatch(openAppsModal(res.form, call));
            return {data: res};
        case AppCallResponseTypes.COMMAND:
            res.data.args.command = res.data.command;
            return dispatch(executeCommand(res.data.command, res.data.args));
        }

        return {data: res};
    };
}

export function openAppsModal(form: AppForm, call: AppCall): Action {
    return openModal({
        modalId: ModalIdentifiers.APPS_MODAL,
        dialogType: AppsModal,
        dialogProps: {
            modal: {
                form,
                call,
            },
        },
    });
}
