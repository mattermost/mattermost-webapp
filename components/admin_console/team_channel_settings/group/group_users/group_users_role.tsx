// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {UserProfile} from 'mattermost-redux/types/users';

import {Group} from 'mattermost-redux/types/groups';

import * as Utils from 'utils/utils';

type ProfileWithGroups = Partial<UserProfile & {
    groups: Partial<Group>[];
}>;

interface GroupUsersRoleProps {
    user: ProfileWithGroups;
}
export default class GroupUsersRole extends React.PureComponent<GroupUsersRoleProps, {}> {
    renderRolesColumn = (member: ProfileWithGroups) => {
        return member.roles!.split(' ').map((role) =>
            Utils.localizeMessage('admin.permissions.roles.' + role + '.name', role),
        ).join(', ');
    };

    render = () => {
        const {user} = this.props;
        return (
            <div className='GroupUsersRole'>
                {this.renderRolesColumn(user)}
            </div>
        );
    };
}
