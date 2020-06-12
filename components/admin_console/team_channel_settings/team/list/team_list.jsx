// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';
import {debounce} from 'mattermost-redux/actions/helpers';

import * as Utils from 'utils/utils.jsx';

import DataGrid from 'components/admin_console/data_grid/data_grid';
import {PAGE_SIZE} from 'components/admin_console/team_channel_settings/abstract_list.jsx';
import TeamIcon from 'components/widgets/team_icon/team_icon';

import './team_list.scss';

const ROW_HEIGHT = 80;
export default class TeamList extends React.PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            searchTeams: PropTypes.func.isRequired,
            getData: PropTypes.func.isRequired,
        }).isRequired,
        data: PropTypes.array,
        total: PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            term: '',
            teams: [],
            page: 0,
            total: 0,
        };
    }

    componentDidMount() {
        this.loadPage();
    }

    getPaginationProps = () => {
        const {page, term} = this.state;
        const total = term === '' ? this.props.total : this.state.total;
        const startCount = (page * PAGE_SIZE) + 1;
        let endCount = (page + 1) * PAGE_SIZE;
        endCount = endCount > total ? total : endCount;
        return {startCount, endCount, total};
    }

    loadPage = async (page = 0, term = '') => {
        this.setState({loading: true, term});

        if (term.length > 0) {
            if (page > 0) {
                this.searchTeams(page, term);
            } else {
                this.searchTeamsDebounced(page, term);
            }
            return;
        }

        await this.props.actions.getData(page, PAGE_SIZE);
        this.setState({page, loading: false});
    }

    searchTeams = async (page = 0, term = '') => {
        const response = await this.props.actions.searchTeams(term, page, PAGE_SIZE);
        const teams = page > 0 ? this.state.teams.concat(response.data.teams) : response.data.teams;
        const total = response.data.total_count;
        this.setState({page, loading: false, teams, total});
    }

    searchTeamsDebounced = debounce((page, term) => this.searchTeams(page, term), 300);

    nextPage = () => {
        this.loadPage(this.state.page + 1);
    }

    previousPage = () => {
        this.setState({page: this.state.page - 1});
    }

    search = (term) => {
        this.loadPage(0, term);
    };

    getColumns = () => {
        const name = (
            <FormattedMessage
                id='admin.team_settings.team_list.nameHeader'
                defaultMessage='Name'
            />
        );
        const management = (
            <FormattedMessage
                id='admin.team_settings.team_list.mappingHeader'
                defaultMessage='Management'
            />
        );

        return [
            {
                name,
                field: 'name',
                width: 3,
                fixed: true,
            },
            {
                name: management,
                field: 'management',
                fixed: true,
            },
            {
                name: '',
                field: 'edit',
                textAlign: 'center',
                fixed: true,
            },
        ];
    }

    renderManagementMethodText = (team) => {
        if (team.group_constrained) {
            return (
                <FormattedMessage
                    id='admin.team_settings.team_row.managementMethod.groupSync'
                    defaultMessage='Group Sync'
                />
            );
        } else if (team.allow_open_invite) {
            return (
                <FormattedMessage
                    id='admin.team_settings.team_row.managementMethod.anyoneCanJoin'
                    defaultMessage='Anyone Can Join'
                />
            );
        }
        return (
            <FormattedMessage
                id='admin.team_settings.team_row.managementMethod.inviteOnly'
                defaultMessage='Invite Only'
            />
        );
    }

    getRows = () => {
        const {data} = this.props;
        const {term, teams} = this.state;
        const {startCount, endCount} = this.getPaginationProps();
        let teamsToDisplay = term.length > 0 ? teams : data;
        teamsToDisplay = teamsToDisplay.slice(startCount - 1, endCount);

        return teamsToDisplay.map((team) => {
            return {
                id: team.id,
                name: (
                    <div className='TeamList_NameText'>
                        <TeamIcon
                            size='sm'
                            url={Utils.imageURLForTeam(team)}
                            name={team.display_name}
                        />
                        <div>
                            <b data-testid='team-display-name'>
                                {team.display_name}
                            </b>
                            {team.description && (
                                <div>
                                    {team.description}
                                </div>
                            )}
                        </div>
                    </div>
                ),
                management: (
                    <span className='TeamList_ManagementText'>
                        {this.renderManagementMethodText(team)}
                    </span>
                ),
                edit: (
                    <span
                        data-testid={`${team.display_name}edit`}
                        className='group-actions'
                    >
                        <Link to={`/admin_console/user_management/teams/${team.id}`}>
                            <FormattedMessage
                                id='admin.team_settings.team_row.configure'
                                defaultMessage='Edit'
                            />
                        </Link>
                    </span>
                ),
            };
        });
    }

    render() {
        const {term} = this.state;
        const rows = this.getRows();
        const columns = this.getColumns();
        const {startCount, endCount, total} = this.getPaginationProps();

        const placeholderEmpty = (
            <FormattedMessage
                id='admin.team_settings.team_list.no_teams_found'
                defaultMessage='No teams found'
            />
        );

        const rowsContainerStyles = {
            minHeight: `${rows.length * ROW_HEIGHT}px`,
        };

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
                search={this.search}
                term={term}
                placeholderEmpty={placeholderEmpty}
                rowsContainerStyles={rowsContainerStyles}
            />
        );
    }
}

