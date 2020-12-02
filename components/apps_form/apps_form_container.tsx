// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {AppCall, AppCallResponse, AppField, AppForm, AppModalState, AppSelectOption} from 'mattermost-redux/types/apps';
import {AppsBindings} from 'mattermost-redux/constants/apps';

import EmojiMap from 'utils/emoji_map';

import InteractiveDialog from './apps_form';

type FormValues = {
    [name: string]: any;
};

export type Props = {
    modal?: AppModalState;
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
        const {modal, postID, teamID, channelID} = this.props;
        if (!modal) {
            return {data: {type: 'error', error: 'There has been an error submitting the dialog. Contact the app developer. Details: props.modal is not defined'}};
        }

        const call: AppCall = {
            ...modal.call,
            type: '',
            values: submission.values,
            context: {
                app_id: modal.call.context.app_id,
                location: postID ? AppsBindings.IN_POST : modal.call.context.location,
                post_id: postID,
                team_id: postID ? teamID : modal.call.context.team_id,
                channel_id: postID ? channelID : modal.call.context.channel_id,
            },
        };

        try {
            const res = await this.props.actions.doAppCall(call);
            return res;
        } catch (e) {
            return {data: {type: 'error', error: e.message}};
        }
    };

    performLookupCall = async (field: AppField, values: FormValues, userInput: string): Promise<AppSelectOption[]> => {
        if (!field.source_url) {
            return [];
        }

        const {postID, channelID, teamID} = this.props;

        const call: AppCall = this.props.modal.call;

        const res = await this.props.actions.doAppCall({
            ...call,
            context: {
                app_id: call.context.app_id,
                location: postID ? AppsBindings.IN_POST : call.context.location,
                post_id: postID,
                team_id: postID ? teamID : call.context.team_id,
                channel_id: postID ? channelID : call.context.channel_id,
            },
            url: field.source_url,
            type: 'lookup',
            values: {
                user_input: userInput,
                values,
                form: this.props.modal.form,
            },
        });

        const items = res?.data?.data?.items;
        if (items && items.length) {
            return items;
        }

        return [];
    }

    onHide = () => {
        this.props.onHide();
    };

    render() {
        if (!this.props.modal) {
            return null;
        }

        const {form, call} = this.props.modal;

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
                refreshNonce={this.state.refreshNonce}
                modal={this.props.modal}
                onHide={this.onHide}
                emojiMap={this.props.emojiMap}
                actions={{
                    submit: this.submitDialog,
                    performLookupCall: this.performLookupCall,
                }}
                isEmbedded={this.props.isEmbedded}
            />
        );
    }
}
