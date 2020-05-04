// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Dictionary} from 'mattermost-redux/types/utilities';

import {UserProfile} from 'mattermost-redux/types/users';
import {TeamMembership} from 'mattermost-redux/types/teams';

import DataGrid, {Column} from 'components/widgets/admin_console/data_grid/data_grid';

import UserGridName from './user_grid_name';
import UserGridRemove from './user_grid_remove';
import UserGridRole from './user_grid_role';

import './user_grid.scss';

type Props = {
    users: UserProfile[];
    memberships: Dictionary<TeamMembership>;

    loadPage: (page: number) => void;
    removeUser: (user: UserProfile) => void;

    totalCount: number;
}

type State = {
    loading: boolean;
    page: number;
    totalCount: number;
    visibleCount: number;
    usersToRemove: { [userId: string]: UserProfile };
    usersToAdd: { [userId: string]: UserProfile };
}

const USERS_PER_PAGE = 10;

export default class UserGrid extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            loading: false,
            page: 0,
            visibleCount: 0,
            totalCount: 0,
            usersToRemove: {},
            usersToAdd: {},
        };
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        if (prevState.totalCount !== nextProps.totalCount) {
            return {
                ...prevState,
                totalCount: nextProps.totalCount,
                visibleCount: nextProps.totalCount,
            };
        }
        return prevState;
    }

    loadPage = (page: number) => {
        this.props.loadPage(page);
        this.setState({page, loading: false});
    }

    nextPage = () => {
        this.loadPage(this.state.page + 1);
    }

    previousPage = () => {
        this.loadPage(this.state.page - 1);
    }

    getPaginationProps = () => {
        const total = this.state.visibleCount;

        const startCount = (this.state.page * USERS_PER_PAGE) + 1;
        let endCount = (this.state.page + 1) * USERS_PER_PAGE;
        if (endCount > total) {
            endCount = total;
        }

        return {startCount, endCount, total};
    }

    removeUser = (user: UserProfile) => {
        const {usersToRemove} = this.state;
        if (usersToRemove[user.id] === user) {
            return;
        }

        let {visibleCount, page} = this.state;
        const {endCount} = this.getPaginationProps();

        this.props.removeUser(user);
        usersToRemove[user.id] = user;
        visibleCount--;

        if (endCount > visibleCount && (endCount % USERS_PER_PAGE) === 1 && page > 0) {
            page--;
        }

        this.setState({usersToRemove, visibleCount, page});
    }

    getRows = () => {
        const {startCount, endCount} = this.getPaginationProps();
        const {usersToRemove, page, totalCount} = this.state;
        const {memberships, users} = this.props;

        let usersToDisplay = users;
        usersToDisplay = usersToDisplay.filter((user) => !usersToRemove[user.id]);
        usersToDisplay = usersToDisplay.slice(startCount - 1, endCount);

        if (usersToDisplay.length < 10 && users.length < (totalCount || 0)) {
            const numberOfUsersRemoved = Object.keys(usersToRemove).length;
            const pagesOfUsersRemoved = Math.floor(numberOfUsersRemoved / USERS_PER_PAGE);
            const pageToLoad = page + pagesOfUsersRemoved + 1;

            // Directly call action to load more users from parent component to load more users into the state
            this.props.loadPage(pageToLoad);
        }

        if (!users || !users.length || !memberships[users[0].id]) {
            return [];
        }

        return usersToDisplay.map((user) => {
            return {
                name: <UserGridName user={user}/>,
                role: <UserGridRole
                    user={user}
                    membership={memberships[user.id]}
                />,
                remove: <UserGridRemove
                    user={user}
                    removeUser={() => this.removeUser(user)}
                />,
            };
        });
    }

    render = () => {
        const columns: Column[] = [
            {name: 'Name', field: 'name', width: 3, fixed: true},
            {name: 'Role', field: 'role'},
            {name: '', field: 'remove', textAlign: 'right', fixed: true},
        ];
        const rows = this.getRows();
        const {startCount, endCount, total} = this.getPaginationProps();

        return (
            <DataGrid
                columns={columns}
                rows={rows}
                loading={this.state.loading}
                page={this.state.page}
                nextPage={this.nextPage}
                previousPage={this.previousPage}
                startCount={startCount}
                endCount={endCount}
                total={total}
            />
        );
    }
}
