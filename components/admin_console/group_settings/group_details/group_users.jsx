// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import GroupUsersRow from 'components/admin_console/group_settings/group_details/group_users_row';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

export default class GroupUsers extends React.PureComponent {
    render = () => {
        return (
            <div className='group-users'>
                <div className='group-users--header'>
                    <FormattedMarkdownMessage
                        id='admin.group_settings.group_profile.group_users.ldapConnector'
                        defaultMessage={'AD/LDAP Connector is configured to sync and manage this group and its users. [Click here to view](/admin_console/authentication/ldap)'}
                    />
                </div>
                <div className='group-users--body'>
                    <GroupUsersRow
                        username='test.user'
                        displayName='Test User'
                        email='test.user@mattermost.com'
                        userId='5ourgmatkfbuun3a167c6x8wca'
                        lastPictureUpdate={0}
                    />
                    <GroupUsersRow
                        username='test.user'
                        displayName='Test User'
                        email='test.user@mattermost.com'
                        userId='5ourgmatkfbuun3a167c6x8wca'
                        lastPictureUpdate={0}
                    />
                    <GroupUsersRow
                        username='test.user'
                        displayName='Test User'
                        email='test.user@mattermost.com'
                        userId='5ourgmatkfbuun3a167c6x8wca'
                        lastPictureUpdate={0}
                    />
                    <GroupUsersRow
                        username='test.user'
                        displayName='Test User'
                        email='test.user@mattermost.com'
                        userId='5ourgmatkfbuun3a167c6x8wca'
                        lastPictureUpdate={0}
                    />
                </div>
            </div>
        );
    };
}
