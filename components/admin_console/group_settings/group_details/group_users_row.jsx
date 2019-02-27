// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Client4} from 'mattermost-redux/client';

export default class GroupUsersRow extends React.PureComponent {
    static propTypes = {
        username: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        userId: PropTypes.string.isRequired,
        lastPictureUpdate: PropTypes.number.isRequired,
    };

    render = () => {
        return (
            <div className='group-users-row'>
                <img
                    className='profile-picture'
                    alt={'user profile image'}
                    src={Client4.getProfilePictureUrl(this.props.userId, this.props.lastPictureUpdate)}
                />
                <div className='user-data'>
                    <div className='name-row'>
                        <span className='username'>{'@' + this.props.username}</span>
                        {'-'}
                        <span className='display-name'>{this.props.displayName}</span>
                    </div>
                    <div>
                        <span className='email-label'>
                            <FormattedMessage
                                id='admin.group_settings.group_details.group_users.email'
                                defaultMessage='Email:'
                            />
                        </span>
                        <span className='email'>&nbsp;{this.props.email}</span>
                    </div>
                </div>
            </div>
        );
    };
}
