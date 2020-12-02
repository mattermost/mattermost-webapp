// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {AppCall, AppCallResponse, AppField, AppForm, AppSelectOption, AppContext} from 'mattermost-redux/types/apps';
import {AppsBindings, AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import EmojiMap from 'utils/emoji_map';

import InteractiveDialog from './apps_form';
import {FormValue} from './apps_form_field/apps_form_select_field';

type FormValues = {
    [name: string]: any;
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

    submitDialog = async (submission: {values: FormValues}): Promise<{data: AppCallResponse<any>}> => {
        //TODO use FormResponseData instead of Any
        const {form, call} = this.props;
        if (!form || !call) {
            return {data: {type: 'error', error: 'There has been an error submitting the dialog. Contact the app developer. Details: props.form or props.call is not defined'}};
        }

        const outCall: AppCall = {
            ...call,
            type: '',
            values: submission.values,
            context: this.getContext(),
        };

        try {
            const res = await this.props.actions.doAppCall(outCall);
            return res;
        } catch (e) {
            return {data: {type: 'error', error: e.message}};
        }
    };

    refreshOnSelect = async (field: AppField, values: FormValues, value: FormValue): Promise<{data: AppCallResponse<any>}> => {
        const {form, call} = this.props;
        if (!form || !call) {
            return {data: {type: 'error', error: 'There has been an error submitting the dialog. Contact the app developer. Details: props.form or props.call is not defined'}};
        }

        if (!field.refresh_url) {
            return {
                data: {
                    type: '',
                    data: {},
                },
            };
        }

        const outCall: AppCall = {
            ...call,
            url: field.refresh_url,
            type: 'form',
            values: {
                values,
                value,
            },
            context: this.getContext(),
        };

        try {
            const res = await this.props.actions.doAppCall(outCall);
            return res;
        } catch (e) {
            return {data: {type: 'error', error: e.message}};
        }
    };

    performLookupCall = async (field: AppField, values: FormValues, userInput: string): Promise<AppSelectOption[]> => {
        if (!field.source_url) {
            return [];
        }

        const {call, form} = this.props;
        if (!call) {
            return [];
        }

        const res = await this.props.actions.doAppCall({
            ...call,
            context: this.getContext(),
            url: field.source_url,
            type: 'lookup',
            values: {
                user_input: userInput,
                values,
                form,
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
            callbackId: '',
            title: form.title,
            introductionText: form.header,
            iconUrl: form.icon,
            submitLabel: '',
            notifyOnCancel: form.submit_on_cancel,
            state: '',
        };

        return (
            <InteractiveDialog
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
