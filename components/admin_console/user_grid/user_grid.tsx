// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {t} from 'utils/i18n';
import AdminPanel from 'components/widgets/admin_console/admin_panel';
import DataGrid from 'components/widgets/admin_console/data_grid/data_grid';

type Props = {
    titleId: string,
    titleDefault: string,
    subtitleId: string,
    subtitleDefault:  string,

    users: any[];
    total?: number,

    teamId?: string;

    actions: {
        getTotalUsersStats: () => Promise<{
            data: boolean;
        }>;
        getProfilesInTeam: (teamId: string, page: number, perPage: number) => Promise<{
            data: boolean;
        }>;
    },
}


type State = {
    loading: boolean;
    page: number;
}

const USERS_PER_PAGE = 10;

export default class UserGrid extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            loading: false,
            page: 0,
        };
    }

    private loadPage = async (page: number) => {
        this.setState({loading: true});

        const {getProfilesInTeam} = this.props.actions;
        const {teamId} = this.props;

        // Filter users by team
        if (getProfilesInTeam && teamId) {
            await getProfilesInTeam(teamId, page, USERS_PER_PAGE);
        }

        this.setState({loading: false, page});
    }

    private nextPage = () => {
        this.setState({loading: true});
        this.loadPage(this.state.page + 1);
    }

    private previousPage = () => {
        this.setState({page: this.state.page - 1});
    }

    componentDidMount() {
        this.props.actions.getTotalUsersStats();
        this.loadPage(0);
    }

    getPaginationProps() {
        let {total} = this.props;
        total += 1; // correct for 0 indexed total

        const startCount = 1 + this.state.page * USERS_PER_PAGE;
        let endCount = (this.state.page + 1) * USERS_PER_PAGE;
        if (endCount > total) {
            endCount = total;
        }

        return { startCount, endCount, total };
    }

    getRows() {
        const {startCount, endCount} = this.getPaginationProps()
        const usersToDisplay = this.props.users.slice(startCount - 1, endCount);

        return usersToDisplay.map((user) => {
            return {
                ...user,
                name: `${user.first_name} ${user.last_name}`,
            };
        });
    }

    render() {
        const columns = [
            {name: 'Name', field: 'name', width: 2},
            {name: 'Position', field: 'position'},
            {name: 'Email', field: 'email'},
        ];

        return (
            <AdminPanel
                id='user_grid'
                titleId={t(this.props.titleId)}
                titleDefault={this.props.titleDefault}
                subtitleId={t(this.props.subtitleId)}
                subtitleDefault={this.props.subtitleDefault}
                // button=
            >
                <DataGrid
                    columns={columns}
                    rows={this.getRows()}
                    loading={this.state.loading}
                    page={this.state.page}
                    nextPage={this.nextPage}
                    previousPage={this.previousPage}
                    {...this.getPaginationProps()}
                />
            </AdminPanel>
        );
    }
}
