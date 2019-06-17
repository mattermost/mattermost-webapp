// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import TeamRow from 'components/admin_console/team_settings/team_row.jsx';
import NextIcon from 'components/icon/next_icon';
import PreviousIcon from 'components/icon/previous_icon';

const TEAMS_PAGE_SIZE = 200;

export default class TeamList extends React.PureComponent {
    static propTypes = {
        teams: PropTypes.arrayOf(PropTypes.object),
        actions: PropTypes.shape({
            getTeams: PropTypes.func.isRequired,
        }).isRequired,
    };

    static defaultProps = {
        teams: [],
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            page: 0,
        };
    }

    componentDidMount() {
        this.props.actions.getTeams(this.state.page, TEAMS_PAGE_SIZE).then(() => {
            this.setState({loading: false});
        });
    }

    previousPage = async (e) => {
        e.preventDefault();
        const page = this.state.page < 1 ? 0 : this.state.page - 1;
        this.setState({page, loading: true});
//        this.searchGroups(page);
    }

    nextPage = async (e) => {
        e.preventDefault();
        const page = this.state.page + 1;
        this.setState({page, loading: true});
  //      this.searchGroups(page);
    }

    renderRows = () => {
        if (this.state.loading) {
            return (
                <div className='groups-list-loading'>
                    <i className='fa fa-spinner fa-pulse fa-2x'/>
                </div>
            );
        }
        if (this.props.teams.length === 0) {
            return (
                <div className='groups-list-empty'>
                    <FormattedMessage
                        id='admin.team_settings.team_list.no_groups_found'
                        defaultMessage='No groups found'
                    />
                </div>
            );
        }
        return this.props.teams.map((item) => {
            return (
                <TeamRow
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    onRowClick={this.onTeamClick}
                    onCheckToggle={this.onCheckToggle}

                />
            );
        });
    }

    render = () => {
        const startCount = (this.state.page * TEAMS_PAGE_SIZE) + 1;
        let endCount = (this.state.page * TEAMS_PAGE_SIZE) + TEAMS_PAGE_SIZE;
        const total = this.props.teams.length;
        if (endCount > total) {
            endCount = total;
        }
        const lastPage = endCount === total;
        const firstPage = this.state.page === 0;
        return (
            <div className='groups-list'>
                <div className='groups-list--header'>
                    <div className='group-name'>
                        <FormattedMessage
                            id='admin.team_settings.team_list.nameHeader'
                            defaultMessage='Name'
                        />
                    </div>
                    <div className='group-description'>
                        <FormattedMessage
                            id='admin.team_settings.team_list.mappingHeader'
                            defaultMessage='Management'
                        />
                    </div>
                    <div className='group-actions'/>
                </div>
                <div className='groups-list--body'>
                    {this.renderRows()}
                </div>
                <div className='groups-list--footer'>
                    <div className='counter'>
                        <FormattedMessage
                            id='admin.team_settings.team_list.paginatorCount'
                            defaultMessage='{startCount, number} - {endCount, number} of {total, number}'
                            values={{
                                startCount,
                                endCount,
                                total,
                            }}
                        />
                    </div>
                    <button
                        className={'btn btn-link prev ' + (firstPage ? 'disabled' : '')}
                        onClick={firstPage ? null : this.previousPage}
                        disabled={firstPage}
                    >
                        <PreviousIcon/>
                    </button>
                    <button
                        className={'btn btn-link next ' + (lastPage ? 'disabled' : '')}
                        onClick={lastPage ? null : this.nextPage}
                        disabled={lastPage}
                    >
                        <NextIcon/>
                    </button>
                </div>
            </div>
        );
    }
}

