// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {createSelector} from 'reselect';

import {Team} from 'mattermost-redux/types/teams';
import {debounce} from 'mattermost-redux/actions/helpers';

import LoadingSpinner from 'components/widgets/loading/loading_spinner';
import InfiniteScroll from 'components/gif_picker/components/InfiniteScroll';
import * as Utils from 'utils/utils.jsx';

import {FilterOption, FilterValues} from '../filter';

import TeamFilterCheckbox from './team_filter_checkbox';

import './team_filter_dropdown.scss';
import '../filter.scss';

type Props = {
    option: FilterOption;
    optionKey: string;
    updateValues: (values: FilterValues, optionKey: string) => void;

    teams: Team[];
    total: number;
    actions: {
        getData: (page: number, perPage: number) => Promise<{ data: any }>;
        searchTeams: (term: string, page?: number, perPage?: number) => Promise<{ data: any }>;
    };
};

type State = {
    page: number;
    loading: boolean;
    show: boolean;
    savedSelectedTeams: Team[];
    searchResults: Team[];
    searchTerm: string;
    searchTotal: number;
}

const getSelectedTeams = createSelector(
    (selectedTeamIds: string[]) => selectedTeamIds,
    (selectedTeamIds: string[], teams: Team[]) => teams,
    (selectedTeamIds, teams) => teams.filter((team) => selectedTeamIds.includes(team.id)),
);

const TEAMS_PER_PAGE = 5;
const MAX_BUTTON_TEXT_LENGTH = 25;
class TeamFilterDropdown extends React.PureComponent<Props, State> {
    private ref: React.RefObject<HTMLDivElement>;

    public constructor(props: Props) {
        super(props);

        this.state = {
            page: 0,
            loading: false,
            show: false,
            savedSelectedTeams: [],
            searchResults: [],
            searchTerm: '',
            searchTotal: 0,
        };

        this.ref = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.handleClickOutside);
        this.props.actions.getData(0, TEAMS_PER_PAGE);
    }

    componentWillUnmount = () => {
        document.removeEventListener('mousedown', this.handleClickOutside);
    }

    hidePopover = () => {
        this.setState({show: false});
    }

    togglePopover = () => {
        if (this.state.show) {
            this.hidePopover();
            return;
        }

        const selectedTeamIds = this.props.option.values.team_ids.value as string[];
        const selectedTeams = getSelectedTeams(selectedTeamIds, this.props.teams);
        const savedSelectedTeams = selectedTeams.sort((a, b) => a.display_name.localeCompare(b.display_name));
        this.setState({show: true, savedSelectedTeams, searchTerm: ''});
    }

    handleClickOutside = (event: MouseEvent) => {
        if (this.ref?.current?.contains(event.target as Node)) {
            return;
        }
        this.hidePopover();
    }

    hasMore = (): boolean => {
        if (this.state.searchTerm.length > 0) {
            return !this.state.loading && this.state.searchTotal > this.state.searchResults.length;
        }
        return !this.state.loading && this.props.total > this.props.teams.length;
    }

    loadMore = async () => {
        const {searchTerm} = this.state;
        this.setState({loading: true});
        const page = this.state.page + 1;
        if (searchTerm.length > 0) {
            this.searchTeams(searchTerm, page);
        } else {
            await this.props.actions.getData(page, TEAMS_PER_PAGE);
        }
        this.setState({page, loading: false});
    }

    searchTeams = async (term: string, page: number) => {
        let searchResults = [];
        let searchTotal = 0;
        const response = await this.props.actions.searchTeams(term, page, TEAMS_PER_PAGE);
        if (response?.data) {
            searchResults = page > 0 ? this.state.searchResults.concat(response.data.teams) : response.data.teams;
            searchTotal = response.data.total_count;
        }
        this.setState({page, loading: false, searchResults, searchTotal, searchTerm: term});
    }

    searchTeamsDebounced = debounce((page, term) => this.searchTeams(term, page), 300, false, () => {});

    handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = e.target.value;
        if (searchTerm.length === 0) {
            this.setState({searchTerm, searchResults: [], searchTotal: 0, page: 0});
            return;
        }
        this.setState({loading: true, searchTerm, searchResults: [], searchTotal: 0, page: 0});
        this.searchTeamsDebounced(0, searchTerm);
    }

    resetTeams = () => {
        this.setState({savedSelectedTeams: [], show: false, searchResults: [], searchTotal: 0, page: 0, searchTerm: ''});
        this.props.updateValues({team_ids: {name: 'Teams', value: []}}, 'teams');
    }

    toggleTeam = (checked: boolean, teamId: string) => {
        const prevSelectedTeamIds = this.props.option.values.team_ids.value as string[];
        let selectedTeamIds;
        if (checked) {
            selectedTeamIds = [...prevSelectedTeamIds, teamId];
        } else {
            selectedTeamIds = prevSelectedTeamIds.filter((id) => id !== teamId);
        }

        this.props.updateValues({team_ids: {name: 'Teams', value: selectedTeamIds}}, 'teams');
    }

    generateButtonText = () => {
        const selectedTeamIds = this.props.option.values.team_ids.value as string[];
        if (selectedTeamIds.length === 0) {
            return {
                buttonText: (
                    <FormattedMessage
                        id='admin.filter.all_teams'
                        defaultMessage='All Teams'
                    />
                ),
                buttonMore: 0,
            };
        }

        const selectedTeams = getSelectedTeams(selectedTeamIds, this.props.teams);
        let buttonText = '';
        let buttonMore = 0;
        let buttonOverflowed = false;
        selectedTeams.forEach((team, index) => {
            buttonOverflowed = buttonOverflowed || !(MAX_BUTTON_TEXT_LENGTH > (buttonText.length + team.display_name.length));
            if (index === 0) {
                buttonText += team.display_name;
            } else if (buttonOverflowed) {
                buttonMore += 1;
            } else {
                buttonText = `${buttonText}, ${team.display_name}`;
            }
        });

        return {buttonText, buttonMore};
    }

    render() {
        const selectedTeamIds = this.props.option.values.team_ids.value as string[];
        const {buttonText, buttonMore} = this.generateButtonText();

        const createFilterCheckbox = (team: Team) => {
            return (
                <TeamFilterCheckbox
                    id={team.id}
                    name={team.id}
                    checked={selectedTeamIds.includes(team.id)}
                    updateOption={this.toggleTeam}
                    label={team.display_name}
                    key={team.id}
                />
            );
        };

        let visibleTeams = this.state.searchResults;
        let selectedTeams: JSX.Element[] = [];
        if (this.state.searchTerm.length === 0) {
            visibleTeams = this.props.teams.filter((team) => !this.state.savedSelectedTeams.some((selectedTeam) => selectedTeam.id === team.id));
            selectedTeams = this.state.savedSelectedTeams.map(createFilterCheckbox);
        }
        const teamsToDisplay = visibleTeams.map(createFilterCheckbox);
        const chevron = this.state.show ? (<i className='Icon icon-chevron-up'/>) : (<i className='Icon icon-chevron-down'/>);

        return (
            <div
                className='FilterList FilterList__full'
            >
                <div className='FilterList_name'>
                    {this.props.option.name}
                </div>

                <div
                    className='TeamFilterDropdown'
                    ref={this.ref}
                >
                    <button
                        className='TeamFilterDropdownButton'
                        onClick={this.togglePopover}
                    >
                        <div className='TeamFilterDropdownButton_text'>
                            {buttonText}
                        </div>

                        {buttonMore > 0 && (
                            <div className='TeamFilterDropdownButton_more'>
                                <FormattedMessage
                                    id='admin.filter.count_more'
                                    defaultMessage='+{count, number} more'
                                    values={{count: buttonMore}}
                                />
                            </div>
                        )}

                        <div className='TeamFilterDropdownButton_icon'>
                            {chevron}
                        </div>
                    </button>

                    <div className={this.state.show ? 'TeamFilterDropdownOptions TeamFilterDropdownOptions__active' : 'TeamFilterDropdownOptions'}>
                        <input
                            className='TeamFilterDropdown_search'
                            type='text'
                            placeholder={Utils.localizeMessage('search_bar.search', 'Search')}
                            value={this.state.searchTerm}
                            onChange={this.handleSearch}
                        />

                        {selectedTeamIds.length > 0 && (
                            <a
                                className='TeamFilterDropdown_reset'
                                onClick={this.resetTeams}
                            >
                                <FormattedMessage
                                    id='admin.filter.reset_teams'
                                    defaultMessage='Reset to all teams'
                                />
                            </a>
                        )}

                        {selectedTeamIds.length === 0 && (
                            <div
                                className='TeamFilterDropdown_allTeams'
                            >
                                <FormattedMessage
                                    id='admin.filter.showing_all_teams'
                                    defaultMessage='Showing all teams'
                                />
                            </div>
                        )}

                        {selectedTeams}

                        {selectedTeams.length > 0 && <div className={'TeamFilterDropdown_divider'}/>}

                        {teamsToDisplay.length === 0 && selectedTeams.length === 0 && !this.state.loading && (
                            <div className='TeamFilterDropdown_empty'>
                                <FormattedMessage
                                    id='admin.filter.no_results'
                                    defaultMessage='No items match'
                                />
                            </div>
                        )}

                        <InfiniteScroll
                            hasMore={this.hasMore()}
                            loadMore={this.loadMore}
                            threshold={1}
                            useWindow={false}
                            initialLoad={false}
                        >
                            {teamsToDisplay}
                        </InfiniteScroll>

                        {this.state.loading && (
                            <div className='TeamFilterDropdown_loading'>
                                <LoadingSpinner/>
                                <FormattedMessage
                                    id='admin.data_grid.loading'
                                    defaultMessage='Loading'
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

export default TeamFilterDropdown;
