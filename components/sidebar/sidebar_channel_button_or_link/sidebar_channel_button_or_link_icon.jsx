// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import {Constants} from 'utils/constants.jsx';

import ArchiveIcon from 'components/widgets/icons/archive_icon';
import DraftIcon from 'components/widgets/icons/draft_icon';
import GlobeIcon from 'components/widgets/icons/globe_icon';
import LockIcon from 'components/widgets/icons/lock_icon';
import StatusIcon from 'components/status_icon.jsx';
import BotIcon from 'components/widgets/icons/bot_icon.jsx';

export default class SidebarChannelButtonOrLinkIcon extends React.PureComponent {
    static propTypes = {
        channelIsArchived: PropTypes.bool.isRequired,
        channelType: PropTypes.string.isRequired,
        channelStatus: PropTypes.string,
        hasDraft: PropTypes.bool.isRequired,
        membersCount: PropTypes.number,
        teammateId: PropTypes.string,
        teammateDeletedAt: PropTypes.number,
        teammateIsBot: PropTypes.bool,
    };

    render() {
        let icon = null;
        if (this.props.channelIsArchived) {
            icon = (
                <ArchiveIcon className='icon icon__archive'/>
            );
        } else if (this.props.hasDraft) {
            icon = (
                <DraftIcon className='icon icon__draft'/>
            );
        } else if (this.props.channelType === Constants.OPEN_CHANNEL) {
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
            } else if (this.props.teammateId && this.props.teammateIsBot) {
                icon = (
                    <BotIcon className='icon icon__bot'/>
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
