// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {UserProfile} from 'mattermost-redux/types/users';
import {FormattedMessage} from 'react-intl';

import {Client4} from 'mattermost-redux/client';
import {Tooltip} from 'react-bootstrap';

import {Group} from 'mattermost-redux/types/groups';

import {t} from 'utils/i18n';
import * as Utils from 'utils/utils';

import OverlayTrigger from 'components/overlay_trigger';
import Avatar from 'components/widgets/users/avatar';

type ProfileWithGroups = Partial<UserProfile & {
    groups: Partial<Group>[];
}>;

interface AdminGroupUsersRowProps {
    displayName: string;
    user: ProfileWithGroups;
    lastPictureUpdate: number;
}
export default class AdminGroupUsersRow extends React.PureComponent<AdminGroupUsersRowProps, {}> {
    renderRolesColumn = (member: ProfileWithGroups) => {
        return member.roles!.split(' ').map((role) =>
            Utils.localizeMessage('admin.permissions.roles.' + role + '.name', role)
        ).join(', ');
    };

    renderGroupsColumn = (member: ProfileWithGroups) => {
        const groups = member.groups || [];
        if ((groups).length === 1) {
            return groups[0].display_name;
        }
        return (
            <OverlayTrigger
                placement='top'
                overlay={<Tooltip id='groupsTooltip'>{groups.map((g) => g.display_name).join(', ')}</Tooltip>}
            >
                <a href='#'>
                    <FormattedMessage
                        id={t('team_channel_settings.group.group_user_row.numberOfGroups')}
                        defaultMessage={'{amount, number} {amount, plural, one {Group} other {Groups}}'}
                        values={{amount: groups.length}}
                    />
                </a>
            </OverlayTrigger>
        );
    };

    render = () => {
        const {user, lastPictureUpdate, displayName} = this.props;
        return (
            <div className='group'>
                <div
                    className='group-row roc'
                    style={{padding: '30px 0px'}}
                >
                    <div className='group-name col-sm-8'>
                        <div className='col-sm-2'>
                            <Avatar
                                username={user.username}
                                url={Client4.getProfilePictureUrl(user.id!, lastPictureUpdate)}
                                size='lg'
                            />
                        </div>
                        <div className='col-sm-10'>
                            <div className='row'>
                                {/* eslint-disable react/jsx-no-literals */}
                                <b>{'@' + user.username}&nbsp;</b>
                                {'-'}&nbsp;{displayName}
                            </div>
                            <div className='row email-group-row'>{user.email}</div>
                        </div>
                    </div>
                    <span className='col-sm-2 group-user-removal-column group-description'>{this.renderRolesColumn(user)}</span>
                    <span className='col-sm-2 group-user-removal-column group-description group-description-link'>
                        {this.renderGroupsColumn(user)}
                    </span>
                </div>
            </div>
        );
    };
}
