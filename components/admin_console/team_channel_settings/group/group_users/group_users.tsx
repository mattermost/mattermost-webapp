// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {UserProfile} from 'mattermost-redux/types/users';

import UserGridName from 'components/admin_console/user_grid/user_grid_name';
import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';

import GroupUsersRole from './group_users_role';
import GroupUsersGroups from './group_users_groups';

import './group_users.scss';

const GROUP_MEMBERS_PAGE_SIZE = 10;

interface AdminGroupUsersProps {
    members: Partial<UserProfile>[];
    total: number;
}

interface AdminGroupUsersState {
    page: number;
    searchTerm: string;
}

export default class AdminGroupUsers extends React.PureComponent<AdminGroupUsersProps, AdminGroupUsersState> {
    state: AdminGroupUsersState = {
        page: 0,
        searchTerm: '',
    }

    previousPage = async () => {
        const page = this.state.page < 1 ? 0 : this.state.page - 1;
        this.setState({page});
    };

    nextPage = async () => {
        const page = (this.state.page + 1) * GROUP_MEMBERS_PAGE_SIZE >= this.props.total ? this.state.page : this.state.page + 1;
        this.setState({page});
    };

    search = (term: string) => {

    }

    private getPaginationProps = () => {
        const {page} = this.state;
        const startCount = (page * GROUP_MEMBERS_PAGE_SIZE) + 1;
        let endCount = (page * GROUP_MEMBERS_PAGE_SIZE) + GROUP_MEMBERS_PAGE_SIZE;
        const total = this.props.total;
        if (endCount > total) {
            endCount = total;
        }
        const lastPage = endCount === total;
        const firstPage = page === 0;

        return {startCount, endCount, page, lastPage, firstPage, total};
    }

    private getRows = (): Row[] => {
        const {members} = this.props;
        const {startCount, endCount} = this.getPaginationProps();

        let usersToDisplay = members;
        usersToDisplay = usersToDisplay.slice(startCount - 1, endCount);

        return usersToDisplay.map((user) => {
            return {
                cells: {
                    id: user.id,
                    name: (
                        <UserGridName
                            user={user}
                        />
                    ),
                    role: (
                        <GroupUsersRole
                            user={user}
                        />
                    ),
                    groups: (
                        <GroupUsersGroups
                            user={user}
                        />
                    ),
                }
            };
        });
    }

    private getColumns = (): Column[] => {
        return [
            {
                name: (
                    <FormattedMessage
                        id='admin.team_channel_settings.user_list.nameHeader'
                        defaultMessage='Name'
                    />
                ),
                field: 'name',
                width: 5,
            },
            {
                name: (
                    <FormattedMessage
                        id='admin.team_channel_settings.user_list.roleHeader'
                        defaultMessage='Role'
                    />
                ),
                field: 'role',
                width: 2,
            },
            {
                name: (
                    <FormattedMessage
                        id='admin.team_channel_settings.user_list.groupsHeader'
                        defaultMessage='Groups'
                    />
                ),
                field: 'groups',
                width: 3,
            },
        ];
    }

    public render = (): JSX.Element => {
        const rows: Row[] = this.getRows();
        const columns: Column[] = this.getColumns();
        const {startCount, endCount, total} = this.getPaginationProps();

        const placeholderEmpty: JSX.Element = (
            <FormattedMessage
                id='admin.member_list_group.notFound'
                defaultMessage='No users found'
            />
        );

        return (
            <div className='GroupUsers'>
                <DataGrid
                    columns={columns}
                    rows={rows}
                    loading={false}
                    page={this.state.page}
                    nextPage={this.nextPage}
                    previousPage={this.previousPage}
                    startCount={startCount}
                    endCount={endCount}
                    total={total}
                    search={this.search}
                    term={this.state.searchTerm || ''}
                    placeholderEmpty={placeholderEmpty}
                />
            </div>
        );
    }
}
