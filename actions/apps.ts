// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {Action, ActionFunc, DispatchFunc} from 'mattermost-redux/types/actions';
import {AppCallResponse, AppCall, AppForm} from 'mattermost-redux/types/apps';
import {AppsBindings, AppCallTypes, AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import {sendEphemeralPost} from 'actions/global_actions';
import {openModal} from 'actions/views/modals';

import AppsModal from 'components/apps_modal';

import {ModalIdentifiers} from 'utils/constants';

const ephemeral = (text: string, call?: AppCall) => sendEphemeralPost(text, (call && call.context.channel_id) || '', call && call.context.root_id);

export function doAppCall<Res=unknown>(call: AppCall): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        const res = await Client4.executeAppCall(call) as AppCallResponse<Res>;

        const responseType = res.type || AppCallResponseTypes.OK;

        switch (responseType) {
        case AppCallResponseTypes.OK:
            if (res.markdown) {
                if (!call.context.channel_id) {
                    return {data: res};
                }

                ephemeral(res.markdown, call);
            }
            return {data: res};
        case AppCallResponseTypes.ERROR:
            return {data: res};
        case AppCallResponseTypes.FORM:
            if (!res.form) {
                const errMsg = 'An error has occurred. Please contact the App developer. Details: Response type is `form`, but no form was included in response.';
                ephemeral(errMsg, call);
                return {data: res};
            }

            if (call.context.location === AppsBindings.COMMAND && call.type === AppCallTypes.FORM) {
                return {data: res};
            }

            dispatch(openAppsModal(res.form, call));
            return {data: res};
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
