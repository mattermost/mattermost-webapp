// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {ChannelWithTeamData} from 'mattermost-redux/types/channels';
import {Link} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';

import {Constants} from 'utils/constants';
import GlobeIcon from 'components/widgets/icons/globe_icon';
import LockIcon from 'components/widgets/icons/lock_icon';

interface Props {
    channel: ChannelWithTeamData;
    onRowClick: (id: string) => void;
}

export default class ChannelRow extends React.Component<Props> {
    private handleRowClick = () => {
        const {channel, onRowClick} = this.props;
        onRowClick(channel.id);
    };

    render(): JSX.Element {
        const {channel} = this.props;
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
                        {channel.type === Constants.PRIVATE_CHANNEL ? (
                            <LockIcon className='channel-icon channel-icon__lock'/>
                        ) : (
                            <GlobeIcon className='channel-icon channel-icon__globe'/>
                        )}
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
                        <Link to={`/admin_console/user_management/channels/${channel.id}`} >
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
