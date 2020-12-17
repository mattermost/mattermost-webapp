// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {AppCall, AppCallResponse, AppField, AppForm, AppFormValue, AppFormValues, AppSelectOption, AppContext} from 'mattermost-redux/types/apps';
import {AppsBindings, AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import EmojiMap from 'utils/emoji_map';

import AppsForm from './apps_form';

const makeError = (errMessage: string) => {
    return {
        data: {
            type: 'error',
            error: 'There has been an error submitting the dialog. Contact the app developer. Details: ' + errMessage,
        },
    };
};

export type Props = {
    form?: AppForm;
    call?: AppCall;
    onHide: () => void;
    actions: {
        doAppCall: (call: AppCall) => Promise<{data: AppCallResponse}>;
    };
    emojiMap: EmojiMap;
    postID?: string;
    channelID?: string;
    teamID?: string;
    isEmbedded?: boolean;
};

export default class AppsFormContainer extends React.PureComponent<Props> {
    state = {
        refreshNonce: '',
    }

    submitDialog = async (submission: {values: AppFormValues}): Promise<{data: AppCallResponse<any>}> => {
        //TODO use FormResponseData instead of Any
        const {form} = this.props;
        if (!form) {
            return makeError('submitDialog props.form is not defined');
        }

        const call = this.getCall();
        if (!call) {
            return makeError('submitDialog props.call is not defined');
        }

        const outCall: AppCall = {
            ...call,
            type: '',
            values: submission.values,
        };

        try {
            const res = await this.props.actions.doAppCall(outCall);
            return res;
        } catch (e) {
            return {data: {type: 'error', error: e.message}};
        }
    };

    refreshOnSelect = async (field: AppField, values: AppFormValues, value: AppFormValue): Promise<{data: AppCallResponse<any>}> => {
        const {form} = this.props;
        if (!form) {
            return makeError('refreshOnSelect props.form is not defined');
        }

        const call = this.getCall();
        if (!call) {
            return makeError('refreshOnSelect props.call is not defined');
        }

        if (!field.refresh) {
            return {
                data: {
                    type: '',
                    data: {},
                },
            };
        }

        const outCall: AppCall = {
            ...call,
            type: 'form',
            values: {
                name: field.name,
                values,
                value,
            },
        };

        try {
            const res = await this.props.actions.doAppCall(outCall);
            return res;
        } catch (e) {
            return {data: {type: 'error', error: e.message}};
        }
    };

    performLookupCall = async (field: AppField, values: AppFormValues, userInput: string): Promise<AppSelectOption[]> => {
        if (!field.source_url) {
            return [];
        }

        const call = this.getCall();
        if (!call) {
            return [];
        }

        const res = await this.props.actions.doAppCall({
            ...call,
            type: 'lookup',
            values: {
                user_input: userInput,
                values,
                name: field.name,

                // form, // instead of including the form, just make sure any form elements that have a blank value in the `values` field here
            },
        });

        if (res.data.type === AppCallResponseTypes.ERROR) {
            return [];
        }

        const data = res.data.data as {items: AppSelectOption[]};
        if (data.items && data.items.length) {
            return data.items;
        }

        return [];
    }

    getCall = (): AppCall | null => {
        const {postID, channelID, teamID, form} = this.props;

        const propsCall = this.props.call;
        const call = (form && form.call) || propsCall;

        if (!call) {
            return null;
        }

        return {
            ...call,
            context: {
                app_id: call.context.app_id,
                location: postID ? AppsBindings.IN_POST : call.context.location,
                post_id: postID,
                team_id: postID ? teamID : call.context.team_id,
                channel_id: postID ? channelID : call.context.channel_id,
            },
        };
    }

    getContext = (): AppContext | null => {
        const {call, postID, channelID, teamID} = this.props;

        if (!call) {
            return null;
        }

        return {
            app_id: call.context.app_id,
            location: postID ? AppsBindings.IN_POST : call.context.location,
            post_id: postID,
            team_id: postID ? teamID : call.context.team_id,
            channel_id: postID ? channelID : call.context.channel_id,
        };
    }

    onHide = () => {
        this.props.onHide();
    };

    render() {
        const {form, call} = this.props;
        if (!form || !call) {
            return null;
        }

        const dialogProps = {
            url: call.url,
            title: form.title || '',
            introductionText: form.header || '',
            iconUrl: form.icon,
            submitLabel: '',
            notifyOnCancel: form.submit_on_cancel,
            state: '',
        };

        return (
            <AppsForm
                {...dialogProps}
                form={form}
                call={call}
                onHide={this.onHide}
                emojiMap={this.props.emojiMap}
                actions={{
                    submit: this.submitDialog,
                    performLookupCall: this.performLookupCall,
                    refreshOnSelect: this.refreshOnSelect,
                }}
                isEmbedded={this.props.isEmbedded}
            />
        );
    }
}
