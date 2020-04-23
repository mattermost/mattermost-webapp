// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {cloneDeep} from 'lodash';

import * as Utils from 'utils/utils.jsx';
import {Constants} from 'utils/constants';

import TeamRow from 'components/admin_console/team_channel_settings/team/list/team_row.jsx';
import AbstractList, {PAGE_SIZE} from 'components/admin_console/team_channel_settings/abstract_list.jsx';
import {browserHistory} from 'utils/browser_history';

import SearchIcon from 'components/widgets/icons/search_icon';

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
            searchString: '',
            teams: [],
            searchTotalCount: 0,
            pageResetKey: 0,
        };
    }

    header() {
        return (
            <>
                {this.searchBar()}
                <div className='groups-list--header'>
                    <div className='group-name adjusted'>
                        <FormattedMessage
                            id='admin.team_settings.team_list.nameHeader'
                            defaultMessage='Name'
                        />
                    </div>
                    <div className='group-content'>
                        <div className='group-description adjusted'>
                            <FormattedMessage
                                id='admin.team_settings.team_list.mappingHeader'
                                defaultMessage='Management'
                            />
                        </div>
                        <div className='group-actions'/>
                    </div>
                </div>
            </>
        );
    }

    searchBar = () => {
        return (
            <div className='groups-list--global-actions'>
                <div className='group-list-search'>
                    <input
                        type='text'
                        placeholder={Utils.localizeMessage('search_bar.search', 'Search')}
                        onKeyUp={this.handleTeamSearchKeyUp}
                        onChange={this.searchBarChangeHandler}
                        value={this.state.searchString}
                        data-testid='search-input'
                    />
                    <SearchIcon
                        id='searchIcon'
                        className='search__icon'
                        aria-hidden='true'
                    />
                    <i
                        className={'fa fa-times-circle group-filter-action ' + (this.state.searchString.length ? '' : 'hidden')}
                        onClick={this.resetSearch}
                        data-testid='clear-search'
                    />
                </div>
            </div>
        );
    }

    searchBarChangeHandler = (e) => {
        this.setState({searchString: e.target.value});
    }

    handleTeamSearchKeyUp = async (e) => {
        const {key} = e;
        const {searchString} = this.state;

        if (key === Constants.KeyCodes.ENTER[0]) {
            if (searchString.length > 1) {
                const response = await this.props.actions.searchTeams(searchString, 0, PAGE_SIZE);
                this.setState({searchMode: true, teams: response.data.teams, searchTotalCount: response.data.total_count, pageResetKey: Date.now()});
            }
        }

        if (searchString.length === 0) {
            this.resetSearch();
        }
    }

    getDataBySearch = async (page, perPage) => {
        if (this.state.searchString.length > 1) {
            const response = await this.props.actions.searchTeams(this.state.searchString, page, perPage);
            const teams = new Array(page * perPage); // Pad the array with empty entries because AbstractList expects to slice the results based on the pagination offset.
            return teams.concat(response.data.teams);
        }
        return [];
    }

    resetSearch = () => {
        this.setState({searchString: '', teams: [], searchMode: false, searchTotalCount: 0, pageResetKey: Date.now()});
    }

    onPageChangedCallback = (pagination, teams) => {
        if (this.state.searchMode) {
            this.setState({teams});
        }
    }

    render() {
        const absProps = cloneDeep(this.props);
        if (this.state.searchMode) {
            absProps.actions.getData = this.getDataBySearch;
        }
        return (
            <AbstractList
                header={this.header()}
                renderRow={this.renderRow}
                {...absProps}
                key={this.state.pageResetKey}
                onPageChangedCallback={this.onPageChangedCallback}
                data={this.state.searchMode ? this.state.teams : this.props.data}
                total={this.state.searchMode ? this.state.searchTotalCount : this.props.total}
            />);
    }

    renderRow = (item) => {
        return (
            <TeamRow
                key={item.id}
                team={item}
                onRowClick={this.onTeamClick}
            />
        );
    }

    onTeamClick = (id) => {
        browserHistory.push(`/admin_console/user_management/teams/${id}`);
    }
}

