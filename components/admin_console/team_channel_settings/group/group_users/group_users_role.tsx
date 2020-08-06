// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {UserProfile} from 'mattermost-redux/types/users';
import {TeamMembership} from 'mattermost-redux/types/teams';
import {ChannelMembership} from 'mattermost-redux/types/channels';

import {Group} from 'mattermost-redux/types/groups';

import * as Utils from 'utils/utils';

type ProfileWithGroups = Partial<UserProfile & {
    groups: Partial<Group>[];
}>;

interface GroupUsersRoleProps {
    user: ProfileWithGroups;
    membership: TeamMembership | ChannelMembership;
    scope: 'team' | 'channel';
}

type Role = 'system_admin' | 'team_admin' | 'team_user' | 'channel_admin' | 'channel_user' | 'guest';
export default class GroupUsersRole extends React.PureComponent<GroupUsersRoleProps, {}> {
    private getCurrentRole = (): Role => {
        const {user, membership, scope} = this.props;

        if (user.roles?.includes('system_admin')) {
            return 'system_admin';
        } else if (membership) {
            if (scope === 'team') {
                if (membership.scheme_admin) {
                    return 'team_admin';
                } else if (membership.scheme_user) {
                    return 'team_user';
                }
            }

            if (scope === 'channel') {
                if (membership.scheme_admin) {
                    return 'channel_admin';
                } else if (membership.scheme_user) {
                    return 'channel_user';
                }
            }
        }

        return 'guest';
    }

    private getLocalizedRole = (role: Role) => {
        switch (role) {
        case 'system_admin':
            return Utils.localizeMessage('admin.user_grid.system_admin', 'System Admin');
        case 'team_admin':
            return Utils.localizeMessage('admin.user_grid.team_admin', 'Team Admin');
        case 'channel_admin':
            return Utils.localizeMessage('admin.user_grid.channel_admin', 'Channel Admin');
        case 'team_user':
        case 'channel_user':
                return Utils.localizeMessage('admin.group_teams_and_channels_row.member', 'Member');
        default:
            return Utils.localizeMessage('admin.user_grid.guest', 'Guest');
        }
    }

    render = () => {
        const currentRole = this.getCurrentRole();
        const localizedRole = this.getLocalizedRole(currentRole);

        return (
            <div className='GroupUsersRole'>
                {localizedRole}
            </div>
        );
    };
}
