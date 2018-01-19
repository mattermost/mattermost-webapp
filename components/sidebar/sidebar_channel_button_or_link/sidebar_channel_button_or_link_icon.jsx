// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.
// @flow

import React from 'react';

import {Constants} from 'utils/constants.jsx';
import StatusIcon from 'components/status_icon.jsx';
import ArchiveIcon from 'components/svg/archive_icon';
import GlobeIcon from 'components/svg/globe_icon';
import LockIcon from 'components/svg/lock_icon';

type Props = {
    channelType: string,
    channelId: string,
    membersCount?: number,
    channelStatus?: string,
    teammateId?: string,
    teammateDeletedAt?: number
}

export default class SidebarChannelButtonOrLinkIcon extends React.PureComponent<Props> {
    props: Props;

    render() {
        var icon = null;
        if (this.props.channelType === Constants.OPEN_CHANNEL) {
            icon = (
                <GlobeIcon className='icon icon__globe'/>
            );
        } else if (this.props.channelType === Constants.PRIVATE_CHANNEL) {
            icon = (
                <LockIcon className='icon icon__lock'/>
            );
        } else if (this.props.channelType === Constants.GM_CHANNEL) {
            icon = <div className='status status--group'>{this.props.membersCount}</div>;
        } else if (this.props.channelType === Constants.DM_CHANNEL) {
            if (this.props.teammateId && this.props.teammateDeletedAt) {
                icon = (
                    <ArchiveIcon className='icon icon__archive'/>
                );
            } else {
                icon = (
                    <StatusIcon
                        type='avatar'
                        status={this.props.channelStatus}
                    />
                );
            }
        }
        return icon;
    }
}
