// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Client4} from 'mattermost-redux/client';
import {Action, ActionFunc, DispatchFunc} from 'mattermost-redux/types/actions';
import {AppCallResponse, AppForm, AppCallType, AppCallRequest, AppContext, AppBinding} from 'mattermost-redux/types/apps';
import {AppCallTypes, AppCallResponseTypes} from 'mattermost-redux/constants/apps';
import {Post} from 'mattermost-redux/types/posts';
import {CommandArgs} from 'mattermost-redux/types/integrations';

import {openModal} from 'actions/views/modals';

import AppsForm from 'components/apps_form';

import {ModalIdentifiers} from 'utils/constants';
import {getSiteURL, shouldOpenInNewTab} from 'utils/url';
import {browserHistory} from 'utils/browser_history';
import {makeCallErrorResponse} from 'utils/apps';

import {cleanForm} from 'mattermost-redux/utils/apps';

import {sendEphemeralPost} from './global_actions';

export function doAppCall<Res=unknown>(call: AppCallRequest, type: AppCallType, intl: any): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        try {
            const res = await Client4.executeAppCall(call, type) as AppCallResponse<Res>;
            const responseType = res.type || AppCallResponseTypes.OK;

            switch (responseType) {
            case AppCallResponseTypes.OK:
                return {data: res};
            case AppCallResponseTypes.ERROR:
                return {error: res};
            case AppCallResponseTypes.FORM:
                if (!res.form) {
                    const errMsg = intl.formatMessage({
                        id: 'apps.error.responses.form.no_form',
                        defaultMessage: 'Response type is `form`, but no form was included in response.',
                    });
                    return {error: makeCallErrorResponse(errMsg)};
                }

                cleanForm(res.form);

                if (type === AppCallTypes.SUBMIT) {
                    dispatch(openAppsModal(res.form, call));
                }

                return {data: res};
            case AppCallResponseTypes.NAVIGATE:
                if (!res.navigate_to_url) {
                    const errMsg = intl.formatMessage({
                        id: 'apps.error.responses.navigate.no_url',
                        defaultMessage: 'Response type is `navigate`, but no url was included in response.',
                    });
                    return {error: makeCallErrorResponse(errMsg)};
                }

                if (type !== AppCallTypes.SUBMIT) {
                    const errMsg = intl.formatMessage({
                        id: 'apps.error.responses.navigate.no_submit',
                        defaultMessage: 'Response type is `navigate`, but the call was not a submission.',
                    });
                    return {error: makeCallErrorResponse(errMsg)};
                }

                if (shouldOpenInNewTab(res.navigate_to_url, getSiteURL())) {
                    window.open(res.navigate_to_url);
                    return {data: res};
                }

                browserHistory.push(res.navigate_to_url.slice(getSiteURL().length));
                return {data: res};
            default: {
                const errMsg = intl.formatMessage({
                    id: 'apps.error.responses.unknown_type',
                    defaultMessage: 'App response type not supported. Response type: {type}.',
                }, {type: responseType});
                return {error: makeCallErrorResponse(errMsg)};
            }
            }
        } catch (error) {
            const errMsg = error.message || intl.formatMessage({
                id: 'apps.error.responses.unexpected_error',
                defaultMessage: 'Received an unexpected error.',
            });
            return {error: makeCallErrorResponse(errMsg)};
        }
    };
}

export function makeFetchBindings(location: string): (userId: string, channelId: string, teamId: string) => ActionFunc {
    return (userId: string, channelId: string, teamId: string): ActionFunc => {
        return async () => {
            try {
                const allBindings = await Client4.getAppsBindings(userId, channelId, teamId);
                const headerBindings = allBindings.filter((b) => b.location === location);
                const bindings = headerBindings.reduce((accum: AppBinding[], current: AppBinding) => accum.concat(current.bindings || []), []);
                return {data: bindings};
            } catch {
                return {data: []};
            }
        };
    };
}

export function openAppsModal(form: AppForm, call: AppCallRequest): Action {
    return openModal({
        modalId: ModalIdentifiers.APPS_MODAL,
        dialogType: AppsForm,
        dialogProps: {
            form,
            call,
        },
    });
}

export function postEphemeralCallResponseForPost(response: AppCallResponse, message: string, post: Post): ActionFunc {
    return sendEphemeralPost(
        message,
        post.channel_id,
        post.root_id || post.id,
        response.app_metadata?.bot_user_id,
    );
}

export function postEphemeralCallResponseForChannel(response: AppCallResponse, message: string, channelID: string): ActionFunc {
    return sendEphemeralPost(
        message,
        channelID,
        '',
        response.app_metadata?.bot_user_id,
    );
}

export function postEphemeralCallResponseForContext(response: AppCallResponse, message: string, context: AppContext): ActionFunc {
    return sendEphemeralPost(
        message,
        context.channel_id,
        context.root_id || context.post_id,
        response.app_metadata?.bot_user_id,
    );
}

export function postEphemeralCallResponseForCommandArgs(response: AppCallResponse, message: string, args: CommandArgs): ActionFunc {
    return sendEphemeralPost(
        message,
        args.channel_id,
        args.root_id,
        response.app_metadata?.bot_user_id,
    );
}
