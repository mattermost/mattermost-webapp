// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Channel} from 'mattermost-redux/types/channels';

type Props = {
    icon: JSX.Element | null;
    channel: Channel;
    hasDraft: boolean;
};

export default class SidebarChannelIcon extends React.PureComponent<Props> {
    render() {
        if (this.props.channel.delete_at !== 0) {
            return (
                <i className='icon icon-archive-outline'/>
            );
        } else if (this.props.hasDraft) {
            return (
                <i className='icon icon-pencil-outline'/>
            );
        }

        return this.props.icon;
    }
}
