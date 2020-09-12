// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {ChannelWithTeamData} from 'mattermost-redux/types/channels';
import {Link} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';

import {Constants} from 'utils/constants';
import GlobeIcon from 'components/widgets/icons/globe_icon';
import LockIcon from 'components/widgets/icons/lock_icon';
import ArchiveIcon from 'components/widgets/icons/archive_icon';

interface Props {
    channel: ChannelWithTeamData;
    onRowClick: (id: string) => void;
    isDisabled? : boolean;
}

export default class ChannelRow extends React.PureComponent<Props> {
    private handleRowClick = () => {
        const {channel, onRowClick} = this.props;
        onRowClick(channel.id);
    };

    render(): JSX.Element {
        const {channel} = this.props;
        let icon;
        if (channel.delete_at !== 0) {
            icon = <ArchiveIcon className='channel-icon channel-icon__archive'/>;
        } else if (channel.type === Constants.PRIVATE_CHANNEL) {
            icon = <LockIcon className='channel-icon channel-icon__lock'/>;
        } else {
            icon = <GlobeIcon className='channel-icon channel-icon__globe'/>;
        }
        return (
            <div
                className='group'
                onClick={this.handleRowClick}
            >
                <div className='group-row'>
                    <span
                        className='group-name overflow--ellipsis row-content'
                        data-testid='channel-display-name'
                    >
                        {icon}
                        {channel.display_name}
                    </span>
                    <span className='group-description row-content'>
                        {channel.team_display_name}
                    </span>
                    <span className='group-description adjusted row-content'>
                        <FormattedMessage
                            id={`admin.channel_settings.channel_row.managementMethod.${channel.group_constrained ? 'group' : 'manual'}`}
                            defaultMessage={channel.group_constrained ? 'Group Sync' : 'Manual Invites'}
                        />
                    </span>
                    <span
                        className='group-actions'
                        data-testid={`${channel.display_name}edit`}
                    >
                        <Link
                            to={`/admin_console/user_management/channels/${channel.id}`}
                        >
                            <FormattedMessage
                                id='admin.channel_settings.channel_row.configure'
                                defaultMessage='Edit'
                            />
                        </Link>
                    </span>
                </div>
            </div>
        );
    }
}
