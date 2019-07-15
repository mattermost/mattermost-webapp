// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import PropTypes from 'prop-types';

import AbstractList from 'components/admin_console/team_channel_settings/abstract_list.jsx';

import GroupRow from './group_row';

const Header = () => {
    return (
        <div className='groups-list--header'>
            <div className='group-name group-name-adjusted'>
                <FormattedMessage
                    id='admin.team_channel_settings.group_list.nameHeader'
                    defaultMessage='Name'
                />
            </div>
            <div className='group-description group-description-adjusted'>
                <FormattedMessage
                    id='admin.team_channel_settings.group_list.membersHeader'
                    defaultMessage='Member Count'
                />
            </div>
            <div className='group-actions'/>
        </div>
    );
};

export default class GroupList extends React.PureComponent {
    static propTypes = {
        removeGroup: PropTypes.func,
    }

    renderRow = (item) => {
        return (
            <GroupRow
                key={item.id}
                group={item}
                removeGroup={this.props.removeGroup}
            />
        );
    }

    render() {
        return (
            <AbstractList
                header={<Header/>}
                renderRow={this.renderRow}
                {...this.props}
            />);
    }
}

