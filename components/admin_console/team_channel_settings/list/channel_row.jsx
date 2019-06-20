// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';

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
                    <span className='group-name'>
                        {channel.display_name}
                    </span>
                    <span className='group-description'>
                        <FormattedMessage
                            id={`admin.team_settings.team_row.managementMethod.${channel.group_constrained ? 'group' : 'manual'}`}
                            defaultMessage={channel.group_constrained ? 'Group Sync' : 'Manual Invites'}
                        />
                    </span>
                    <span className='group-actions'>
                        <Link to={`/admin_console/user_management/channels/${channel.id}`}>
                            <FormattedMessage
                                id='admin.team_settings.team_row.configure'
                                defaultMessage='Edit'
                            />
                        </Link>
                    </span>
                </div>
            </div>
        );
    };
}
