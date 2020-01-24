// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router-dom';

import {Channel} from 'mattermost-redux/types/channels';

type Props = {
    channel: Channel;
    currentTeamName: string;
};

type State = {

};

export default class SidebarFakeChannel extends React.PureComponent<Props, State> {
    render() {
        const {channel, currentTeamName} = this.props;
        const channelStringified = String(channel.fake && JSON.stringify(channel));

        return (
            <div>
                <Link to={`/${currentTeamName}/channels/${channel.name}?fakechannel=${encodeURIComponent(channelStringified)}`}>{channel.display_name}</Link>
            </div>
        );
    }
}
