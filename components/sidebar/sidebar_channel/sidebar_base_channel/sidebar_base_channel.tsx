// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Channel} from 'mattermost-redux/types/channels';

import {trackEvent} from 'actions/telemetry_actions';
import * as GlobalActions from 'actions/global_actions';

import SidebarChannelLink from 'components/sidebar/sidebar_channel/sidebar_channel_link';
import {localizeMessage} from 'utils/utils';
import Constants from 'utils/constants';

type Props = {
    channel: Channel;
    currentTeamName: string;
    isCollapsed: boolean;
    actions: {
        leaveChannel: (channelId: any) => void;
    };
};

type State = {

};

export default class SidebarBaseChannel extends React.PureComponent<Props, State> {
    handleLeavePublicChannel = () => {
        this.props.actions.leaveChannel(this.props.channel.id);
        trackEvent('ui', 'ui_public_channel_x_button_clicked');
    }

    handleLeavePrivateChannel = () => {
        GlobalActions.showLeavePrivateChannelModal({id: this.props.channel.id, display_name: this.props.channel.display_name});
        trackEvent('ui', 'ui_private_channel_x_button_clicked');
    }

    getCloseHandler = () => {
        const {channel} = this.props;

        if (channel.type === Constants.OPEN_CHANNEL && channel.name !== Constants.DEFAULT_CHANNEL) {
            return this.handleLeavePublicChannel;
        } else if (channel.type === Constants.PRIVATE_CHANNEL) {
            return this.handleLeavePrivateChannel;
        }

        return null;
    }

    getIcon = () => {
        const {channel} = this.props;

        if (channel.type === Constants.OPEN_CHANNEL) {
            return (
                <i className='icon icon-globe'/>
            );
        } else if (channel.type === Constants.PRIVATE_CHANNEL) {
            return (
                <i className='icon icon-lock-outline'/>
            );
        }

        return null;
    }

    render() {
        const {channel, currentTeamName} = this.props;

        let ariaLabelPrefix;
        if (channel.type === Constants.OPEN_CHANNEL) {
            ariaLabelPrefix = localizeMessage('accessibility.sidebar.types.public', 'public channel');
        } else if (channel.type === Constants.PRIVATE_CHANNEL) {
            ariaLabelPrefix = localizeMessage('accessibility.sidebar.types.private', 'private channel');
        }

        return (
            <SidebarChannelLink
                channel={channel}
                link={`/${currentTeamName}/channels/${channel.name}`}
                label={channel.display_name}
                ariaLabelPrefix={ariaLabelPrefix}
                closeHandler={this.getCloseHandler()!}
                icon={this.getIcon()!}
                isCollapsed={this.props.isCollapsed}
            />
        );
    }
}
