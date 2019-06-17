// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';

export default class GroupRow extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        groupConstrained: PropTypes.bool,
        name: PropTypes.string.isRequired,
        onRowClick: PropTypes.func.isRequired,
    };

    onRowClick = () => {
        const {id, onRowClick: onRowClick1} = this.props;
        onRowClick1(id);
    }
    render = () => {
        const {id, name, groupConstrained} = this.props;
        return (
            <div
                className={'group '}
                onClick={this.onRowClick}
            >
                <div className='group-row'>
                    <span className='group-name'>
                        {name}
                    </span>
                    <span className='group-description'>
                        <FormattedMessage
                            id={`admin.team_settings.team_row.managementMethod.${groupConstrained ? 'group' : 'manual'}`}
                            defaultMessage={groupConstrained ? 'Group Sync' : 'Manual Invites'}
                        />
                    </span>
                    <span className='group-actions'>
                        <Link to={`/admin_console/user_management/teams/${id}`}>
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
