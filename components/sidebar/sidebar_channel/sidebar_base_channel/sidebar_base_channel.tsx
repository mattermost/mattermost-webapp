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

export default class SidebarBaseChannel extends React.PureComponent<Props, State> {
    render() {
        const {channel, currentTeamName} = this.props;

        return (
           <Link to={`/${currentTeamName}/channels/${channel.name}`}>{channel.display_name}</Link>
        );
    }
}
