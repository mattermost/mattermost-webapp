// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';

import GroupUsersRow from 'components/admin_console/group_settings/group_details/group_users_row';
import FormattedMarkdownMessage from 'components/formatted_markdown_message';

export default class GroupUsers extends React.PureComponent {
    static propTypes = {
        members: PropTypes.arrayOf(PropTypes.object),
        memberCount: PropTypes.number.isRequired,
    };

    render = () => {
        const {members} = this.props;
        return (
            <div className='group-users'>
                <div className='group-users--header'>
                    <FormattedMarkdownMessage
                        id='admin.group_settings.group_profile.group_users.ldapConnector'
                        defaultMessage={'AD/LDAP Connector is configured to sync and manage this group and its users. [Click here to view](/admin_console/authentication/ldap)'}
                    />
                </div>
                <div className='group-users--body'>
                    {members.map((member) => {
                        return (
                            <GroupUsersRow
                                username={member.username}
                                displayName={member.first_name + ' ' + member.last_name}
                                email={member.email}
                                userId={member.id}
                                lastPictureUpdate={0}
                            />
                        );
                    })}
                </div>
            </div>
        );
    };
}
