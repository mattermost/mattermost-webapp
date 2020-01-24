// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Link} from 'react-router-dom';

import {Channel} from 'mattermost-redux/types/channels';

type Props = {
    channel: Channel;
    teammateUsername?: string;
    currentTeamName: string;
};

type State = {

};

export default class SidebarDirectChannel extends React.PureComponent<Props, State> {
    render() {
        const {channel, teammateUsername, currentTeamName} = this.props;

        return (
            <div>
                <Link to={`/${currentTeamName}/messages/@${teammateUsername}`}>{channel.display_name}</Link>
            </div>
        );
    }
}
