// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {makeLookupCallPayload} from 'mattermost-redux/actions/apps';
import {AppCall, AppCallResponse, AppField, AppForm, AppFormValue, AppFormValues, AppSelectOption, AppContext} from 'mattermost-redux/types/apps';
import {AppsBindings, AppCallResponseTypes} from 'mattermost-redux/constants/apps';

import EmojiMap from 'utils/emoji_map';

import AppsForm from './apps_form';

const makeError = (errMessage: string) => {
    return {
        data: {
            type: 'error',
            error: 'There has been an error submitting the modal. Contact the app developer. Details: ' + errMessage,
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

export type State = {
    form?: AppForm;
}

export default class AppsFormContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {form: props.form};
    }

    submitForm = async (submission: {values: AppFormValues}): Promise<{data: AppCallResponse<any>}> => {
        //TODO use FormResponseData instead of Any
        const {form} = this.state;
        if (!form) {
            return makeError('submitForm state.form is not defined');
        }

        const call = this.getCall();
        if (!call) {
            return makeError('submitForm props.call is not defined');
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
        const {form} = this.state;
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

            if (res?.data?.form) {
                this.setState({form: res.data.form});
            }

            return res;
        } catch (e) {
            return {data: {type: 'error', error: e.message}};
        }
    };

    performLookupCall = async (field: AppField, formValues: AppFormValues, userInput: string): Promise<AppSelectOption[]> => {
        if (!field.refresh) {
            return [];
        }

        const call = this.getCall();
        if (!call) {
            return [];
        }

        const values = makeLookupCallPayload(field.name, userInput, formValues);
        const res = await this.props.actions.doAppCall({
            ...call,
            type: 'lookup',
            values,
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
        const {form} = this.state;

        const {call, postID, channelID, teamID} = this.props;
        if (!call) {
            return null;
        }

        return {
            ...call,
            ...form?.call,
            context: {
                ...call.context,
                ...form?.call?.context,
                app_id: call.context.app_id,
                location: postID ? AppsBindings.IN_POST : call.context.location,
                post_id: postID || call.context.post_id,
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
        const call = this.getCall();
        if (!call) {
            return null;
        }

        const {form} = this.state;
        if (!form) {
            return null;
        }

        return (
            <AppsForm
                form={form}
                call={call}
                onHide={this.onHide}
                emojiMap={this.props.emojiMap}
                actions={{
                    submit: this.submitForm,
                    performLookupCall: this.performLookupCall,
                    refreshOnSelect: this.refreshOnSelect,
                }}
                isEmbedded={this.props.isEmbedded}
            />
        );
    }
}
