// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Channel} from 'mattermost-redux/types/channels';

import ArchiveIcon from 'components/widgets/icons/archive_icon';
import DraftIcon from 'components/widgets/icons/draft_icon';

type Props = {
    icon: JSX.Element | null;
    channel: Channel;
    hasDraft: boolean;
};

export default class SidebarChannelIcon extends React.PureComponent<Props> {
    render() {
        if (this.props.channel.delete_at !== 0) {
            return (
                <ArchiveIcon className='icon icon__archive'/>
            );
        } else if (this.props.hasDraft) {
            return (
                <DraftIcon className='icon icon__draft'/>
            );
        }

        return this.props.icon;
    }
}
