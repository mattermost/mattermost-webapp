// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {IntlShape, injectIntl} from 'react-intl';

import {Client4} from 'mattermost-redux/client';

import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import {trackEvent} from 'actions/telemetry_actions';
import ProfilePicture from 'components/profile_picture';
import {browserHistory} from 'utils/browser_history';
import {Constants} from 'utils/constants';

import SidebarChannelLink from '../sidebar_channel_link';

type Props = {
    intl: IntlShape;
    channel: Channel;
    teammate?: UserProfile;
    currentTeamName: string;
    currentUserId: string;
    redirectChannel: string;
    active: boolean;
    botIconUrl: string | null;
    isCollapsed: boolean;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<{data: boolean}>;
        leaveDirectChannel: (channelId: string) => Promise<{data: boolean}>;
    };
};

type State = {
    svgErrorUrl: string | null;
};

class SidebarDirectChannel extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            svgErrorUrl: null,
        };
    }

    handleLeaveChannel = (callback: () => void) => {
        const id = this.props.channel.teammate_id;
        const category = Constants.Preferences.CATEGORY_DIRECT_CHANNEL_SHOW;

        const currentUserId = this.props.currentUserId;
        this.props.actions.savePreferences(currentUserId, [{user_id: currentUserId, category, name: id!, value: 'false'}]).then(callback);
        this.props.actions.leaveDirectChannel(this.props.channel.name);

        trackEvent('ui', 'ui_direct_channel_x_button_clicked');

        if (this.props.active) {
            browserHistory.push(`/${this.props.currentTeamName}/channels/${this.props.redirectChannel}`);
        }
    }

    onSvgLoadError = () => {
        this.setState({
            svgErrorUrl: this.props.botIconUrl,
        });
    }

    onSvgLoad = () => {
        this.setState({
            svgErrorUrl: null,
        });
    }

    getIcon = () => {
        const {channel, teammate} = this.props;

        if (!teammate) {
            return null;
        }

        if (teammate.id && teammate.delete_at) {
            return (
                <i className='icon icon-archive-outline'/>
            );
        }

        let className = '';
        if (channel.status === 'online') {
            className = 'status-online';
        } else if (channel.status === 'away') {
            className = 'status-away';
        } else if (channel.status === 'dnd') {
            className = 'status-dnd';
        }

        return (
            <ProfilePicture
                src={Client4.getProfilePictureUrl(teammate.id, teammate.last_picture_update)}
                size={'xs'}
                status={teammate.is_bot ? '' : channel.status}
                wrapperClass='DirectChannel__profile-picture'
                newStatusIcon={true}
                statusClass={`DirectChannel__status-icon ${className}`}
            />
        );
    }

    render() {
        const {channel, teammate, currentTeamName} = this.props;

        if (!teammate) {
            return null;
        }

        let displayName = channel.display_name;
        if (this.props.currentUserId === teammate.id) {
            displayName = this.props.intl.formatMessage({
                id: 'sidebar.directchannel.you',
                defaultMessage: '{displayname} (you)',
            }, {
                displayname: channel.display_name,
            });
        }

        return (
            <SidebarChannelLink
                teammateId={teammate.id}
                channel={channel}
                link={`/${currentTeamName}/messages/@${teammate.username}`}
                label={displayName}
                closeHandler={this.handleLeaveChannel}
                icon={this.getIcon()}
                isCollapsed={this.props.isCollapsed}
            />
        );
    }
}

export default injectIntl(SidebarDirectChannel);
