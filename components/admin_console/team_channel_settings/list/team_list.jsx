// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import TeamRow from 'components/admin_console/team_channel_settings/list/team_row.jsx';
import AbstractList from 'components/admin_console/team_channel_settings/list/abstract_list.jsx';
import {browserHistory} from 'utils/browser_history';

export default class TeamList extends AbstractList {
    renderRow = (item) => {
        return (
            <TeamRow
                key={item.id}
                team={item}
                onRowClick={this.onTeamClick}
                onCheckToggle={this.onCheckToggle}
            />
        );
    }

    onTeamClick = (id) => {
        browserHistory.push(`/admin_console/user_management/teams/${id}`);
    }

    renderHeader() {
        return (
            <div className='groups-list--header'>
                <div className='group-name'>
                    <FormattedMessage
                        id='admin.team_settings.team_list.nameHeader'
                        defaultMessage='Name'
                    />
                </div>
                <div className='group-description'>
                    <FormattedMessage
                        id='admin.team_settings.team_list.mappingHeader'
                        defaultMessage='Management'
                    />
                </div>
                <div className='group-actions'/>
            </div>
        );
    }
}

