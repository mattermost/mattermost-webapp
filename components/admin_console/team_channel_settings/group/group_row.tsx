// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Group} from 'mattermost-redux/types/groups';
import {FormattedMessage} from 'react-intl';

interface GroupRowProps {
    group: Partial<Group>;
    removeGroup: (gid: string) => void;
    key?: string;
}

export default class GroupRow extends React.Component<GroupRowProps> {
    removeGroup = () => {
        this.props.removeGroup(this.props.group.id!);
    };

    render = () => {
        const {group} = this.props;
        return (
            <div className={'group'}>
                <div className='group-row'>
                    <span className='group-name row-content'>{group.display_name || group.name}</span>
                    <span className='group-description row-content'>
                        <FormattedMessage
                            id='admin.team_channel_settings.group_row.members'
                            defaultMessage='{memberCount, number} {memberCount, plural, one {member} other {members}}'
                            values={{memberCount: group.member_count}}
                        />
                    </span>
                    <span className='group-actions'>
                        <a
                            href='#'
                            onClick={this.removeGroup}
                        >
                            <FormattedMessage
                                id='admin.team_channel_settings.group_row.remove'
                                defaultMessage='Remove'
                            />
                        </a>
                    </span>
                </div>
            </div>
        );
    };
}
