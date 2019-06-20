// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import AbstractList from 'components/admin_console/team_channel_settings/list/abstract_list.jsx';
import {browserHistory} from 'utils/browser_history';

import ChannelRow from './channel_row';

export default class TeamList extends AbstractList {
    renderRow = (item) => {
        return (
            <ChannelRow
                key={item.id}
                channel={item}
                onRowClick={this.onChannelClick}
            />
        );
    }

    onChannelClick = (id) => {
        browserHistory.push(`/admin_console/user_management/channels/${id}`);
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

