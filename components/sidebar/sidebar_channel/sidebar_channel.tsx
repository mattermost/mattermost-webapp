// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router-dom';

import {Channel} from 'mattermost-redux/types/channels';

import Constants from 'utils/constants';

type Props = {
    channel: Channel;
    teammateUsername?: string;
    currentTeamName: string;
};

type State = {

};

export default class SidebarChannel extends React.PureComponent<Props, State> {
    render() {
        const {channel, teammateUsername, currentTeamName} = this.props;
        const channelStringified = String(channel.fake && JSON.stringify(channel));

        let link = '';
        if (channel.fake) {
            link = `/${currentTeamName}/channels/${channel.name}?fakechannel=${encodeURIComponent(channelStringified)}`;
        } else if (channel.type === Constants.DM_CHANNEL) {
            link = `/${currentTeamName}/messages/@${teammateUsername}`;
        } else if (channel.type === Constants.GM_CHANNEL) {
            link = `/${currentTeamName}/messages/${channel.name}`;
        } else {
            link = `/${currentTeamName}/channels/${channel.name}`;
        }

        return (
            <div>
                <Link to={link}>{channel.display_name}</Link>
            </div>
        );
    }
}
