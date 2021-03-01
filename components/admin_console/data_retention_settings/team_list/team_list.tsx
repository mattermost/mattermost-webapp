// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';
import {debounce} from 'mattermost-redux/actions/helpers';

import {Team, TeamSearchOpts, TeamsWithCount} from 'mattermost-redux/types/teams';

import {browserHistory} from 'utils/browser_history';

import * as Utils from 'utils/utils.jsx';

import DataGrid, {Column} from 'components/admin_console/data_grid/data_grid';
import {PAGE_SIZE} from 'components/admin_console/team_channel_settings/abstract_list.jsx';
import TeamIcon from 'components/widgets/team_icon/team_icon';

import './team_list.scss';
import {FilterOptions} from 'components/admin_console/filter/filter';

const ROW_HEIGHT = 80;

type Props = {
    teams: Team[];
    total: number;
    actions: {
        searchTeams(term: string, opts: TeamSearchOpts): Promise<{data: TeamsWithCount}>;
        getData(page: number, size: number): void;
    };
}

type State = {
    loading: boolean;
    page: number;
}
export default class TeamList extends React.PureComponent<Props, State> {
    public constructor(props: Props) {
        super(props);

        this.state = {
            loading: false,
            page: 0,
        };
    }

    private loadPage = async (page: number) => {
        const {loadProfilesAndReloadTeamMembers} = this.props.actions;
        const {teamId, filters} = this.props;
        this.setState({loading: true});
        this.loadPage(page);
        await loadProfilesAndReloadTeamMembers(page + 1, PROFILE_CHUNK_SIZE, teamId, {active: true, ...filters});
        this.setState({page, loading: false});
    }

    render() {


        return (
            <div className='TeamsList'>
                <DataGrid
                    columns={columns}
                    rows={rows}
                    loading={this.state.teamsLoading}
                    page={this.state.teamsPage}
                    nextPage={this.nextPage}
                    previousPage={this.previousPage}
                    startCount={startCount}
                    endCount={endCount}
                    total={total}
                    className={'customTable'}
                    // onSearch={this.onSearch}
                    // term={term}
                    // placeholderEmpty={placeholderEmpty}
                    // rowsContainerStyles={rowsContainerStyles}
                    // filterProps={filterProps}
                />
            </div>
        );
    }
}

