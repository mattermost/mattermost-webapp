// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';

import {Constants} from 'utils/constants';
import GlobeIcon from 'components/widgets/icons/globe_icon';
import LockIcon from 'components/widgets/icons/lock_icon';

export default class ChannelRow extends React.Component {
    static propTypes = {
        channel: PropTypes.object.isRequired,
        onRowClick: PropTypes.func.isRequired,
    };

    handleRowClick = () => {
        const {channel, onRowClick} = this.props;
        onRowClick(channel.id);
    }
    render = () => {
        const {channel} = this.props;
        return (
            <div
                className={'group '}
                onClick={this.handleRowClick}
            >
                <div className='group-row'>
                    <span className='group-name overflow--ellipsis row-content'>
                        {channel.type === Constants.PRIVATE_CHANNEL ? <LockIcon className='channel-icon channel-icon__lock'/> : <GlobeIcon className='channel-icon channel-icon__globe'/>}
                        {channel.display_name}
                    </span>
                    <span className='group-description row-content'>
                        {channel.team_name}
                    </span>
                    <span className='group-description adjusted row-content'>
                        <FormattedMessage
                            id={`admin.channel_settings.channel_row.managementMethod.${channel.group_constrained ? 'group' : 'manual'}`}
                            defaultMessage={channel.group_constrained ? 'Group Sync' : 'Manual Invites'}
                        />
                    </span>
                    <span className='group-actions'>
                        <Link to={`/admin_console/user_management/channels/${channel.id}`}>
                            <FormattedMessage
                                id='admin.channel_settings.channel_row.configure'
                                defaultMessage='Edit'
                            />
                        </Link>
                    </span>
                </div>
            </div>
        );
    };
}
