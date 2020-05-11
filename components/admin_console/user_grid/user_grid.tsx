// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {CSSProperties} from 'react';
import {FormattedMessage} from 'react-intl';

import {Dictionary} from 'mattermost-redux/types/utilities';

import {UserProfile} from 'mattermost-redux/types/users';
import {TeamMembership} from 'mattermost-redux/types/teams';
import {ChannelMembership} from 'mattermost-redux/types/channels';

import DataGrid, {Row, Column} from 'components/widgets/admin_console/data_grid/data_grid';

import UserGridName from './user_grid_name';
import UserGridRemove from './user_grid_remove';
import UserGridRoleDropdown, {Role} from './user_grid_role_dropdown';

import './user_grid.scss';

type Props = {
    users: UserProfile[];
    memberships: Dictionary<TeamMembership> | Dictionary<ChannelMembership>;

    excludeUsers: { [userId: string]: UserProfile };
    includeUsers: { [userId: string]: UserProfile };

    loadPage: (page: number) => void;
    search: (term: string) => void;
    removeUser: (user: UserProfile) => void;
    updateMemberRolesForUser: (userId: string, role: Role) => void;

    totalCount: number;
    loading: boolean;
}

type State = {
    loading: boolean;
    page: number;
    membershipsToUpdate: { [userId: string]: TeamMembership | ChannelMembership };
    term: string;
}

const USERS_PER_PAGE = 10;

export default class UserGrid extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            loading: false,
            page: 0,
            membershipsToUpdate: {},
            term: '',
        };
    }

    isSearching() {
        return this.state.term !== '';
    }

    loadPage = (page: number) => {
        this.setState({loading: true});
        this.props.loadPage(page);
        this.setState({page, loading: false});
    }

    nextPage = () => {
        this.loadPage(this.state.page + 1);
    }

    previousPage = () => {
        this.loadPage(this.state.page - 1);
    }

    search = async (term: string) => {
        this.setState({page: 0, term, loading: true});
        await this.props.search(term);
        this.setState({loading: false});
    }

    getVisibleTotalCount = () => {
        const {includeUsers, excludeUsers, totalCount} = this.props;
        const includeUsersCount = Object.keys(includeUsers).length;
        const excludeUsersCount = Object.keys(excludeUsers).length;
        return totalCount + (includeUsersCount - excludeUsersCount);
    }

    getPaginationProps = () => {
        const {includeUsers, excludeUsers} = this.props;
        const {page, term} = this.state;

        let total: number;
        let startCount = 0;
        let endCount = 0;

        if (term === '') {
            total = this.getVisibleTotalCount();
            startCount = (page * USERS_PER_PAGE) + 1;
            endCount = (page + 1) * USERS_PER_PAGE;
            endCount = endCount > total ? total : endCount;
        } else {
            total = this.props.users.length + Object.keys(includeUsers).length;
            this.props.users.forEach((u) => {
                if (excludeUsers[u.id]) {
                    total -= 1;
                }
            });
            endCount = total;
        }
        return {startCount, endCount, total};
    }

    removeUser = (user: UserProfile) => {
        const {excludeUsers} = this.props;
        if (excludeUsers[user.id] === user) {
            return;
        }

        let {page} = this.state;
        const {endCount} = this.getPaginationProps();

        this.props.removeUser(user);
        if (endCount > this.getVisibleTotalCount() && (endCount % USERS_PER_PAGE) === 1 && page > 0) {
            page--;
        }

        this.setState({page});
    }

    updateMembership = (userId: string, role: Role) => {
        const {membershipsToUpdate} = this.state;
        const {memberships} = this.props;

        membershipsToUpdate[userId] = {
            ...memberships[userId],
            roles: role,
        };

        this.props.updateMemberRolesForUser(userId, role);
        this.setState({membershipsToUpdate}, this.forceUpdate);
    }

    getRows = () => {
        const {page, membershipsToUpdate} = this.state;
        const {memberships, users, excludeUsers, includeUsers, totalCount} = this.props;

        let usersToDisplay = users;
        const includeUsersList = Object.values(includeUsers);

        // Remove users to remove and add users to add
        usersToDisplay = usersToDisplay.filter((user) => !excludeUsers[user.id]);
        usersToDisplay = [...includeUsersList, ...usersToDisplay];

        // Dont load more elements if searching
        if (this.state.term === '') {
            const {startCount, endCount} = this.getPaginationProps();
            usersToDisplay = usersToDisplay.slice(startCount - 1, endCount);

            if (usersToDisplay.length < 10 && users.length < (totalCount || 1)) {
                const numberOfUsersRemoved = Object.keys(excludeUsers).length;
                const pagesOfUsersRemoved = Math.floor(numberOfUsersRemoved / USERS_PER_PAGE);
                const pageToLoad = page + pagesOfUsersRemoved + 1;

                // Directly call action to load more users from parent component to load more users into the state
                this.props.loadPage(pageToLoad);
            }
        }

        return usersToDisplay.map((user) => {
            return {
                id: user.id,
                name: (
                    <UserGridName
                        user={user}
                        isSaved={!includeUsers[user.id]}
                    />
                ),
                role: (
                    <UserGridRoleDropdown
                        user={user}
                        membership={membershipsToUpdate[user.id] || memberships[user.id]}
                        handleUpdateMembership={(role: Role) => this.updateMembership(user.id, role)}
                    />
                ),
                remove: (
                    <UserGridRemove
                        user={user}
                        removeUser={() => this.removeUser(user)}
                    />
                ),
            };
        });
    }

    getColumns = (): Column[] => {
        return [
            {
                name: 'Name',
                field: 'name',
                width: 3,
                fixed: true,
            },
            {
                name: 'Role',
                field: 'role',

                // Requires overflow visible in order to render dropdown
                overflow: 'visible',
            },
            {
                name: '',
                field: 'remove',
                textAlign: 'right',
                fixed: true,
            },
        ];
    }

    render = () => {
        const rows: Row[] = this.getRows();
        const columns: Column[] = this.getColumns();
        const {startCount, endCount, total} = this.getPaginationProps();

        const placeholderEmpty: JSX.Element = (
            <FormattedMessage
                id='user_grid.notFound'
                defaultMessage='No users found'
            />
        );

        return (
            <DataGrid
                columns={columns}
                rows={rows}
                loading={this.state.loading || this.props.loading}
                page={this.state.page}
                nextPage={this.nextPage}
                previousPage={this.previousPage}
                startCount={startCount}
                endCount={endCount}
                total={total}
                search={this.search}
                placeholderEmpty={placeholderEmpty}
            />
        );
    }
}
