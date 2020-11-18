// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Channel} from 'mattermost-redux/types/channels';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import {trackEvent} from 'actions/telemetry_actions';
import {browserHistory} from 'utils/browser_history';
import Constants from 'utils/constants';

import SidebarChannelLink from 'components/sidebar/sidebar_channel/sidebar_channel_link';

type Props = {
    channel: Channel;
    currentTeamName: string;
    currentUserId: string;
    redirectChannel: string;
    active: boolean;
    membersCount: number;
    isCollapsed: boolean;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<{data: boolean}>;
    };
};

type State = {

};

export default class SidebarGroupChannel extends React.PureComponent<Props, State> {
    handleLeaveChannel = (callback: () => void) => {
        const id = this.props.channel.id;
        const category = Constants.Preferences.CATEGORY_GROUP_CHANNEL_SHOW;

        const currentUserId = this.props.currentUserId;
        this.props.actions.savePreferences(currentUserId, [{user_id: currentUserId, category, name: id, value: 'false'}]).then(callback);

        trackEvent('ui', 'ui_direct_channel_x_button_clicked');

        if (this.props.active) {
            browserHistory.push(`/${this.props.currentTeamName}/channels/${this.props.redirectChannel}`);
        }
    }

    getIcon = () => {
        return (
            <div className='status status--group'>{this.props.membersCount}</div>
        );
    }

    render() {
        const {channel, currentTeamName} = this.props;

        return (
            <SidebarChannelLink
                channel={channel}
                link={`/${currentTeamName}/messages/${channel.name}`}
                label={channel.display_name}
                closeHandler={this.handleLeaveChannel}
                icon={this.getIcon()}
                isCollapsed={this.props.isCollapsed}
            />
        );
    }
}
