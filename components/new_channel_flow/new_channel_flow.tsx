// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {ChannelType, Channel} from 'mattermost-redux/types/channels';
import {ServerError} from 'mattermost-redux/types/errors';

import Constants, {ModalIdentifiers} from 'utils/constants';
import * as Utils from 'utils/utils';
import {cleanUpUrlable} from 'utils/url';

import NewChannelModal from 'components/new_channel_modal';
import ChangeURLModal from 'components/change_url_modal';

export const SHOW_NEW_CHANNEL = 1;
export const SHOW_EDIT_URL = 2;
export const SHOW_EDIT_URL_THEN_COMPLETE = 3;

export function getChannelTypeFromProps(props: Props): ChannelType {
    let channelType = props.channelType || Constants.OPEN_CHANNEL;
    if (!props.canCreatePublicChannel && channelType === Constants.OPEN_CHANNEL) {
        channelType = Constants.PRIVATE_CHANNEL as ChannelType;
    }
    if (!props.canCreatePrivateChannel && channelType === Constants.PRIVATE_CHANNEL) {
        channelType = Constants.OPEN_CHANNEL as ChannelType;
    }
    return channelType;
}

export type Props = {

    /**
     * Set to Constants.OPEN_CHANNEL or Constants.PRIVATE_CHANNEL depending on which modal we should show first
     */
    channelType: ChannelType;

    /**
     * The current team ID
     */
    currentTeamId: string;

    /**
     * Permission to create public channel
     */
    canCreatePublicChannel: boolean;

    /**
     * Permission to create private channel
     */
    canCreatePrivateChannel: boolean;

    actions: {
        createChannel: (channel: Channel) => Promise<{data?: Channel; error?: ServerError}>;
        switchToChannel: (channel: Channel) => Promise<{data?: true; error?: true}>;
        closeModal: (modalId: string) => void;
    };
};

type State = {
    serverError: JSX.Element | string | null;
    channelType: ChannelType;
    flowState: number;
    channelDisplayName: string;
    channelName: string;
    channelPurpose: string;
    channelHeader: string;
    nameModified: boolean;
}

type NewChannelData = {
    displayName: string;
    purpose: string;
    header: string;
}

export default class NewChannelFlow extends React.PureComponent<Props, State> {
    public static defaultProps = {
        channelType: Constants.OPEN_CHANNEL as ChannelType,
    };

    public constructor(props: Props) {
        super(props);

        this.state = {
            serverError: '',
            channelType: getChannelTypeFromProps(props),
            flowState: SHOW_NEW_CHANNEL,
            channelDisplayName: '',
            channelName: '',
            channelPurpose: '',
            channelHeader: '',
            nameModified: false,
        };
    }

    onSubmit = () => {
        if (!this.state.channelDisplayName) {
            this.setState({serverError: Utils.localizeMessage('channel_flow.invalidName', 'Invalid Channel Name')});
            return;
        }

        if (this.state.channelName.length < 2) {
            this.setState({flowState: SHOW_EDIT_URL_THEN_COMPLETE});
            return;
        }

        const {actions, currentTeamId} = this.props;
        const channel: Channel = {
            team_id: currentTeamId,
            name: this.state.channelName,
            display_name: this.state.channelDisplayName,
            purpose: this.state.channelPurpose,
            header: this.state.channelHeader,
            type: this.state.channelType,
            create_at: 0,
            creator_id: '',
            delete_at: 0,
            extra_update_at: 0,
            group_constrained: false,
            id: '',
            last_post_at: 0,
            scheme_id: '',
            total_msg_count: 0,
            update_at: 0,
        };

        actions.createChannel(channel).then(({data, error}) => {
            if (error) {
                this.onCreateChannelError(error);
            } else if (data) {
                this.onModalDismissed();
                actions.switchToChannel(data);
            }
        });
    };

    onModalDismissed = () => {
        this.props.actions.closeModal(ModalIdentifiers.NEW_CHANNEL_FLOW);
    }

    onCreateChannelError = (err: ServerError) => {
        if (err.server_error_id === 'model.channel.is_valid.2_or_more.app_error') {
            this.setState({
                flowState: SHOW_EDIT_URL_THEN_COMPLETE,
                serverError: (
                    <FormattedMessage
                        id='channel_flow.handleTooShort'
                        defaultMessage='Channel URL must be 2 or more lowercase alphanumeric characters'
                    />
                ),
            });
        } else if (err.server_error_id === 'store.sql_channel.update.exists.app_error') {
            this.setState({serverError: Utils.localizeMessage('channel_flow.alreadyExist', 'A channel with that URL already exists')});
        } else {
            this.setState({serverError: err.message});
        }
    };

    typeSwitched = (channelType: ChannelType) => {
        this.setState({
            channelType,
            serverError: '',
        });
    };

    urlChangeRequested = (e: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
        }
        this.setState({flowState: SHOW_EDIT_URL});
    };

    urlChangeSubmitted = (newURL: string) => {
        if (this.state.flowState === SHOW_EDIT_URL_THEN_COMPLETE) {
            this.setState({channelName: newURL, nameModified: true}, this.onSubmit);
        } else {
            this.setState({flowState: SHOW_NEW_CHANNEL, serverError: null, channelName: newURL, nameModified: true});
        }
    };

    urlChangeDismissed = () => {
        this.setState({flowState: SHOW_NEW_CHANNEL});
    };

    channelDataChanged = (data: NewChannelData) => {
        this.setState({
            channelDisplayName: data.displayName,
            channelPurpose: data.purpose,
            channelHeader: data.header,
        });
        if (!this.state.nameModified) {
            this.setState({channelName: cleanUpUrlable(data.displayName.trim())});
        }
    };

    render() {
        const channelData = {
            name: this.state.channelName,
            displayName: this.state.channelDisplayName,
            purpose: this.state.channelPurpose,
            header: this.state.channelHeader,
        };

        let showChannelModal = false;
        let showChangeURLModal = false;

        let changeURLTitle: string | JSX.Element = '';
        let changeURLSubmitButtonText: string | JSX.Element = '';

        // Only listen to flow state if we are being shown
        switch (this.state.flowState) {
        case SHOW_NEW_CHANNEL:
            showChannelModal = true;
            break;
        case SHOW_EDIT_URL:
            showChangeURLModal = true;
            changeURLTitle = (
                <FormattedMessage
                    id='channel_flow.changeUrlTitle'
                    defaultMessage='Change Channel URL'
                />
            );
            changeURLSubmitButtonText = changeURLTitle;
            break;
        case SHOW_EDIT_URL_THEN_COMPLETE:
            showChangeURLModal = true;
            changeURLTitle = (
                <FormattedMessage
                    id='channel_flow.set_url_title'
                    defaultMessage='Set Channel URL'
                />
            );
            changeURLSubmitButtonText = (
                <FormattedMessage
                    id='channel_flow.create'
                    defaultMessage='Create Channel'
                />
            );
            break;
        }

        return (
            <span>
                <NewChannelModal
                    show={showChannelModal}
                    channelType={this.state.channelType}
                    canCreatePublicChannel={this.props.canCreatePublicChannel}
                    canCreatePrivateChannel={this.props.canCreatePrivateChannel}
                    channelData={channelData}
                    serverError={this.state.serverError}
                    onSubmitChannel={this.onSubmit}
                    onModalDismissed={this.onModalDismissed}
                    onTypeSwitched={this.typeSwitched}
                    onChangeURLPressed={this.urlChangeRequested}
                    onDataChanged={this.channelDataChanged}
                />
                <ChangeURLModal
                    show={showChangeURLModal}
                    title={changeURLTitle}
                    submitButtonText={changeURLSubmitButtonText}
                    currentURL={this.state.channelName}
                    serverError={this.state.serverError}
                    onModalSubmit={this.urlChangeSubmitted}
                    onModalDismissed={this.urlChangeDismissed}
                />
            </span>
        );
    }
}
