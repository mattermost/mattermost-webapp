// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import Svg from 'react-inlinesvg';

import {Channel} from 'mattermost-redux/types/channels';
import {UserProfile} from 'mattermost-redux/types/users';
import {PreferenceType} from 'mattermost-redux/types/preferences';

import {trackEvent} from 'actions/diagnostics_actions';
import {browserHistory} from 'utils/browser_history';
import {Constants} from 'utils/constants';

import ArchiveIcon from 'components/widgets/icons/archive_icon';
import StatusIcon from 'components/status_icon.jsx';
import BotIcon from 'components/widgets/icons/bot_icon.jsx';
import SidebarChannelLink from '../sidebar_channel_link';

type Props = {
    channel: Channel;
    teammate: UserProfile;
    currentTeamName: string;
    currentUserId: string;
    redirectChannel: string;
    active: boolean;
    botIconUrl: string;
    actions: {
        savePreferences: (userId: string, preferences: PreferenceType[]) => Promise<{data: boolean}>;
    };
};

type State = {
    svgErrorUrl: string | null;
};

export default class SidebarDirectChannel extends React.PureComponent<Props, State> {
    handleLeaveChannel = (callback: () => void) => {
        const id = this.props.channel.teammate_id;
        const category = Constants.Preferences.CATEGORY_DIRECT_CHANNEL_SHOW;

        const currentUserId = this.props.currentUserId;
        this.props.actions.savePreferences(currentUserId, [{user_id: currentUserId, category, name: id!, value: 'false'}]).then(callback);

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

        if (teammate.id && teammate.delete_at) {
            return (
                <ArchiveIcon className='icon icon__archive'/>
            );
        } else if (teammate.id && teammate.is_bot) {
            // Use default bot icon
            let icon = (<BotIcon className='icon icon__bot'/>);

            // Attempt to display custom icon if botIconUrl has changed
            // or if there was no error when loading custom svg
            if (this.props.botIconUrl &&
                this.props.botIconUrl !== this.state.svgErrorUrl) {
                icon = (
                    <Svg
                        className='icon icon__bot'
                        src={this.props.botIconUrl}
                        onLoad={this.onSvgLoad}
                        onError={this.onSvgLoadError}
                    />
                );
            }
            return icon;
        }

        return (
            <StatusIcon
                type='avatar'
                status={channel.status}
            />
        );
    }

    render() {
        const {channel, teammate, currentTeamName} = this.props;

        return (
            <SidebarChannelLink
                channel={channel}
                link={`/${currentTeamName}/messages/@${teammate.username}`}
                label={channel.display_name}
                closeHandler={this.handleLeaveChannel}
                icon={this.getIcon()}
            />
        );
    }
}
