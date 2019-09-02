// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import AbstractList from 'components/admin_console/team_channel_settings/abstract_list.jsx';
import {browserHistory} from 'utils/browser_history';

import ChannelRow from './channel_row';

const Header = () => {
    return (
        <div className='groups-list--header'>
            <div className='group-name adjusted'>
                <FormattedMessage
                    id='admin.channel_settings.channel_list.nameHeader'
                    defaultMessage='Name'
                />
            </div>
            <div className='group-description'>
                <FormattedMessage
                    id='admin.channel_settings.channel_list.teamHeader'
                    defaultMessage='Team'
                />
            </div>
            <div className='group-description adjusted'>
                <FormattedMessage
                    id='admin.channel_settings.channel_list.managementHeader'
                    defaultMessage='Management'
                />
            </div>
            <div className='group-actions'/>
        </div>
    );
};

export default class ChannelList extends React.PureComponent {
    render() {
        return (
            <AbstractList
                header={<Header/>}
                renderRow={this.renderRow}
                {...this.props}
            />);
    }

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
}

