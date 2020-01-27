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

    page: number;
    perPage: number;

    teamId?: string;

    actions: {
        getProfilesInTeam: (teamId: string, page: number, perPage: number) => Promise<{
            data: boolean;
        }>;
    },
}

export default class UserGrid extends React.PureComponent<Props> {
    componentDidMount() {
        const {getProfilesInTeam} = this.props.actions;
        const {teamId, page, perPage} = this.props;
        if (getProfilesInTeam && teamId) {
            getProfilesInTeam(teamId, page, perPage);
        }
    }

    render() {
        const columns = [
            {name: 'Name', field: 'name'},
            {name: 'Position', field: 'position'},
        ];

        const rows = this.props.users.map((user) => {
            return {
                ...user,
                name: `${user.first_name} ${user.last_name}`,
            };
        });


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
                    rows={rows}
                />
            </AdminPanel>
        );
    }
}
