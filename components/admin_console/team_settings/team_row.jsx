// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';

export default class GroupRow extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        onRowClick: PropTypes.func,
    };

    render = () => {
        return (
            <div
                className={'group '}
                onClick={this.props.onRowClick}
            >
                <div className='group-row'>

                    <span className='group-name'>
                        {this.props.name}
                    </span>
                    <span className='group-description'>
                        Manual Invites
                    </span>
                    <span className='group-actions'>
                        <Link to={'/admin_console/user_management/teams/' + this.props.id}>
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
