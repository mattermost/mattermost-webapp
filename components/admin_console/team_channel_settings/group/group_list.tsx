// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Group} from 'mattermost-redux/types/groups';

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
            <div className='group-content'>
                <div className='group-description group-description-adjusted'>
                    <FormattedMessage
                        id='admin.team_channel_settings.group_list.membersHeader'
                        defaultMessage='Member Count'
                    />
                </div>
                <div className='group-description group-description-adjusted'>
                    <FormattedMessage
                        id='admin.team_channel_settings.group_list.rolesHeader'
                        defaultMessage='Roles'
                    />
                </div>
                <div className='group-actions'/>
            </div>
        </div>
    );
};

interface Props {
    data?: Partial<Group>[];
    onPageChangedCallback: () => void;
    total: number;
    emptyListTextId: string;
    emptyListTextDefaultMessage: string;
    actions: {
        getData: () => void;
    };
    removeGroup: (gid: string) => void;
    setNewGroupRole: (gid: string) => void;
    type: string;
}

export default class GroupList extends React.PureComponent<Props> {
    renderRow = (item: Group) => {
        return (
            <GroupRow
                key={item.id}
                group={item}
                removeGroup={this.props.removeGroup}
                setNewGroupRole={this.props.setNewGroupRole}
                type={this.props.type}
            />
        );
    }

    render(): JSX.Element {
        return (
            <AbstractList
                header={<Header/>}
                renderRow={this.renderRow}
                {...this.props}
            />
        );
    }
}
