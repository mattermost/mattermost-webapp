// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import AbstractList from 'components/admin_console/team_channel_settings/abstract_list.jsx';

import GroupRow from './group_row';

export default class GroupList extends AbstractList {
    renderRow = (item) => {
        return (
            <GroupRow
                key={item.id}
                group={item}
                removeGroup={this.props.removeGroup}
            />
        );
    }

    renderHeader() {
        return (
            <div className='groups-list--header'>
                <div className='group-name'>
                    <FormattedMessage
                        id='admin.team_settings.group_list.nameHeader'
                        defaultMessage='Name'
                    />
                </div>
                <div className='group-description'>
                    <FormattedMessage
                        id='admin.team_settings.group_list.membersHeader'
                        defaultMessage='Members'
                    />
                </div>
                <div className='group-actions'/>
            </div>
        );
    }
}

