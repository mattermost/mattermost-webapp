// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Tooltip} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {UserProfile} from 'mattermost-redux/types/users';
import {Group} from 'mattermost-redux/types/groups';

import {t} from 'utils/i18n';
import OverlayTrigger from 'components/overlay_trigger';

type ProfileWithGroups = Partial<UserProfile & {
    groups: Partial<Group>[];
}>;

interface GroupUsersGroupsProps {
    user: ProfileWithGroups;
}
export default class GroupUsersGroups extends React.PureComponent<GroupUsersGroupsProps, {}> {
    renderGroupsColumn = (user: ProfileWithGroups) => {
        const groups = user.groups || [];
        if ((groups).length === 1) {
            return groups[0].display_name;
        }

        const message = (
            <FormattedMessage
                id={t('team_channel_settings.group.group_user_row.numberOfGroups')}
                defaultMessage={'{amount, number} {amount, plural, one {Group} other {Groups}}'}
                values={{amount: groups.length}}
            />
        );

        if (groups.length === 0) {
            return message;
        }

        const tooltip = <Tooltip id='groupsTooltip'>{groups.map((g) => g.display_name).join(', ')}</Tooltip>;

        return (
            <OverlayTrigger
                placement='bottom'
                overlay={tooltip}
            >
                <a href='#'>
                    {message}
                </a>
            </OverlayTrigger>
        );
    };

    render = () => {
        const {user} = this.props;
        return (
            <div className='GroupUsersGroups'>
                {this.renderGroupsColumn(user)}
            </div>
        );
    };
}
