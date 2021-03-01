// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {DataRetentionCustomPolicy} from 'mattermost-redux/types/data_retention';
import {Team, TeamSearchOpts} from 'mattermost-redux/types/teams';
import {IDMappedObjects} from 'mattermost-redux/types/utilities';

import * as Utils from 'utils/utils.jsx';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import TitleAndButtonCardHeader from 'components/card/title_and_button_card_header/title_and_button_card_header';
import Card from 'components/card/card';
import ChannelsList from 'components/admin_console/team_channel_settings/channel/list';
import Input from 'components/input';
import {PAGE_SIZE} from 'components/admin_console/team_channel_settings/abstract_list.jsx';
import DropdownInput from 'components/dropdown_input';
import TeamList from 'components/admin_console/data_retention_settings/team_list';
import TeamSelectorModal from 'components/team_selector_modal';
import ChannelSelectorModal from 'components/channel_selector_modal';
import DropdownInputTransformer from 'components/widgets/inputs/dropdown_input_transformer';
import DataGrid, {Column} from 'components/admin_console/data_grid/data_grid';
import TeamIcon from 'components/widgets/team_icon/team_icon';

import './custom_policy_form.scss';

type Props = {
    policyId?: string;
    policy?: DataRetentionCustomPolicy;
    actions: {
        fetchPolicy: (id: string) => Promise<{ data: DataRetentionCustomPolicy }>;
        fetchPolicyTeams: (id: string, page: number, perPage: number) => Promise<{ data: Team[] }>;
    };
    teams?: Team[];
    setNavigationBlocked: () => void;
};

type State = {
    addTeamOpen: boolean;
    addChannelOpen: boolean;
    messageRetentionInputValue: string;
    messageRetentionDropdownValue: any;
    teams: Team[];
    teamsLoading: boolean;
    teamsTotal: number;
    teamsPage: number;
    teamsTerm: string;
    teamsSearchTotal: number;
    teamsSearchErrored: boolean;
    teamsFilters: TeamSearchOpts;
    removedTeamsCount: number;
    removedTeams: IDMappedObjects<Team>;
    newTeams: IDMappedObjects<Team>;
    saveNeeded: boolean;
}

export default class CustomPolicyForm extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            addTeamOpen: false,
            addChannelOpen: false,
            messageRetentionInputValue: '',
            messageRetentionDropdownValue: {value: 'forever', label: 'Keep Forever'},
            teams: [],
            teamsLoading: false,
            teamsTotal: 0,
            teamsPage: 0,
            teamsTerm: '',
            teamsSearchTotal: 0,
            teamsSearchErrored: false,
            teamsFilters: {},
            removedTeamsCount: 0,
            removedTeams: {},
            newTeams: {},
            saveNeeded: true,
        };
    }

    openAddChannel = () => {
        this.setState({addChannelOpen: true});
    }

    closeAddChannel = () => {
        this.setState({addChannelOpen: false});
    }

    openAddTeam = () => {
        this.setState({addTeamOpen: true});
    }

    closeAddTeam = () => {
        this.setState({addTeamOpen: false});
    }

    getMessageRetentionDefaultValue = () => {
        // if (!this.props.config.DataRetentionSettings.EnableMessageDeletion) {
        //     return {value: 'forever', label: 'Keep Forever'};
        // }
        
        // if (this.props.config.DataRetentionSettings.MessageRetentionDays % 365 === 0) {
        //     return {value: 'years', label: 'Years'};
        // }

        return {value: 'forever', label: 'Keep Forever'};
    }

    componentDidMount = async () => {
        if (this.props.policyId) {
            await this.props.actions.fetchPolicy(this.props.policyId);
            this.loadPage();
            this.setState({teamsTotal: this.props.policy?.team_count || 0});
        }
    }
    isSearching = (term: string, filters: TeamSearchOpts) => {
        return (term.length + Object.keys(filters).length) > 0;
    }

    addToNewTeams = (teams: Team[]) => {
        let {removedTeamsCount} = this.state;
        const {newTeams, removedTeams} = this.state;
        teams.forEach((team: Team) => {
            if (removedTeams[team.id]?.id === team.id) {
                delete removedTeams[team.id];
                removedTeamsCount -= 1;
            } else {
                newTeams[team.id] = team;
            }
        });
        this.setState({newTeams: {...newTeams}, removedTeams: {...removedTeams}, removedTeamsCount, saveNeeded: true});
        this.props.setNavigationBlocked();
    }

    addToRemovedTeams = (team: Team) => {
        let {removedTeamsCount} = this.state;
        const {newTeams, removedTeams} = this.state;
        if (newTeams[team.id]?.id === team.id) {
            delete newTeams[team.id];
        } else if (removedTeams[team.id]?.id !== team.id) {
            removedTeamsCount += 1;
            removedTeams[team.id] = team;
        }
        this.setState({removedTeams: {...removedTeams}, newTeams: {...newTeams}, removedTeamsCount, saveNeeded: true});
        this.props.setNavigationBlocked();
    }
    getPaginationProps = () => {
        const {teamsPage, teamsTerm, teamsFilters} = this.state;
        const total = this.isSearching(teamsTerm, teamsFilters) ? this.state.teamsSearchTotal : this.state.teamsTotal;
        const startCount = (teamsPage * PAGE_SIZE) + 1;
        let endCount = (teamsPage + 1) * PAGE_SIZE;
        endCount = endCount > total ? total : endCount;
        return {startCount, endCount, total};
    }

    getTeamsColumns = (): Column[] => {
        const name = (
            <FormattedMessage
                id='admin.team_settings.team_list.nameHeader'
                defaultMessage='Name'
            />
        );

        return [
            {
                name,
                field: 'name',
                fixed: true,
            },
            {
                name: '',
                field: 'remove',
                textAlign: 'right',
                fixed: true,
            },
        ];
    }

    getTeamsRows = () => {
        const {teamsTerm, teams, teamsFilters} = this.state;
        const {startCount, endCount} = this.getPaginationProps();

        let teamsToDisplay = this.isSearching(teamsTerm, teamsFilters) ?  teams : this.props.teams;

        if (teamsToDisplay) {
            teamsToDisplay = teamsToDisplay.slice(startCount - 1, endCount);
            return teamsToDisplay.map((team) => {
                return {
                    cells: {
                        id: team.id,
                        name: (
                            <div className='TeamList_nameColumn'>
                                <div className='TeamList__lowerOpacity'>
                                    <TeamIcon
                                        size='sm'
                                        url={Utils.imageURLForTeam(team)}
                                        content={team.display_name}
                                    />
                                </div>
                                <div className='TeamList_nameText'>
                                    <b data-testid='team-display-name'>
                                        {team.display_name}
                                    </b>
                                </div>
                            </div>
                        ),
                        remove: (
                            <span
                                data-testid={`${team.display_name}edit`}
                                className='group-actions TeamList_editText'
                                onClick={(e) => {
                                    this.setState({removedTeams: [...this.state.removedTeams, team.id]})
                                }}
                            >
                                <FormattedMessage
                                    id='admin.data_retention.custom_policy.teams.remove'
                                    defaultMessage='Remove'
                                />
                            </span>
                        ),
                    },
                };
            });
        }
        return [];
    }

    previousPage = () => {
        this.setState({teamsPage: this.state.teamsPage - 1});
    }

    nextPage = () => {
        this.loadPage(this.state.teamsPage + 1, this.state.teamsTerm, this.state.teamsFilters);
    }

    loadPage = async (page = 0, term = '', filters = {}) => {
        this.setState({teamsLoading: true, teamsTerm: term, teamsFilters: filters});

        // if (this.isSearching(term, filters)) {
        //     if (page > 0) {
        //         this.searchTeams(page, term, filters);
        //     } else {
        //         this.searchTeamsDebounced(page, term, filters);
        //     }
        //     return;
        // }
        if (this.props.policyId) {
            await this.props.actions.fetchPolicyTeams(this.props.policyId, page, PAGE_SIZE);
        }
        
        this.setState({teamsLoading: false, teamsPage: page});
    }

    render = () => {
        const rows = this.getTeamsRows();
        const columns = this.getTeamsColumns();
        const {startCount, endCount, total} = this.getPaginationProps();

        return (
            <div className='wrapper--fixed DataRetentionSettings'>
                <FormattedAdminHeader
                    id='admin.data_retention.title'
                    defaultMessage='Data Retention Policy'
                />
                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <Card
                           expanded={true}
                           className={'console'}
                        >
                            <Card.Header>
                                <TitleAndButtonCardHeader
                                    title={
                                        <FormattedMessage
                                            id='admin.data_retention.custom_policy.form.title'
                                            defaultMessage='Name and retention'
                                        />
                                    }
                                    subtitle={
                                        <FormattedMessage
                                            id='admin.data_retention.custom_policy.form.subTitle'
                                            defaultMessage='Give your policy a name and configure retention settings.'
                                        />
                                    }
                                />
                            </Card.Header>
                            <Card.Body>
                                <Input
                                    name='policyName'
                                    type='text'
                                    value={''}
                                    onChange={() => {}}
                                    placeholder={Utils.localizeMessage('admin.data_retention.custom_policy.form.input', 'Policy name')}
                                    required={true}
                                />
                                <DropdownInputTransformer
                                    onDropdownChange={(value) => {
                                        // if (value.value === 'forever') {
                                        //     this.setState({'enableMessageDeletion': false});
                                        // } else {
                                        //     this.setState({'enableMessageDeletion': true});
                                        // }
                                        this.setState({ messageRetentionDropdownValue: value });
                                    }}
                                    onInputChange={(e) => {
                                        this.setState({ messageRetentionInputValue: e.target.value });
                                        // let messageRetentionDays;
                                        // if (this.state.messageRetentionDropdownValue.value === 'years') {
                                        //     messageRetentionDays = parseInt(e.target.value) * 365;
                                        // } else {
                                        //     messageRetentionDays = e.target.value;
                                        // }
                                        // this.handleChange('messageRetentionDays', messageRetentionDays);
                                    }}
                                    value={this.state.messageRetentionDropdownValue}
                                    inputValue={this.state.messageRetentionInputValue}
                                    width={500}
                                    exceptionToInput={['forever']}
                                    defaultValue={this.getMessageRetentionDefaultValue()}
                                    options={[{value: 'days', label: 'Days'}, {value: 'years', label: 'Years'}, {value: 'forever', label: 'Keep Forever'}]}
                                    legend={Utils.localizeMessage('admin.data_retention.form.channelAndDirectMessageRetention', 'Channel & direct message retention')}
                                    placeholder={Utils.localizeMessage('admin.data_retention.form.channelAndDirectMessageRetention', 'Channel & direct message retention')}
                                    name={'channel_message_retention'}
                                />
                            </Card.Body>
                        </Card>
                        {this.state.addTeamOpen &&
                            <TeamSelectorModal
                                onModalDismissed={this.closeAddTeam}
                                onTeamsSelected={() => {}}
                                modalID={'CUSTOM_POLICY_TEAMS'}
                            />
                        }
                        <Card
                            expanded={true}
                            className={'console'}
                        >
                            <Card.Header>
                                <TitleAndButtonCardHeader
                                    title={
                                        <FormattedMessage
                                            id='admin.data_retention.custom_policy.team_selector.title'
                                            defaultMessage='Assigned teams'
                                        />
                                    }
                                    subtitle={
                                        <FormattedMessage
                                            id='admin.data_retention.custom_policy.team_selector.subTitle'
                                            defaultMessage='Add teams that will follow this retention policy.'
                                        />
                                    }
                                    buttonText={
                                        <FormattedMessage
                                            id='admin.data_retention.custom_policy.team_selector.addTeams'
                                            defaultMessage='Add teams'
                                        />
                                    }
                                    onClick={this.openAddTeam}
                                />
                            </Card.Header>
                            <Card.Body>
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
                            </Card.Body>
                        </Card>
                        {this.state.addChannelOpen &&
                            <ChannelSelectorModal
                                onModalDismissed={this.closeAddChannel}
                                onChannelsSelected={() => {}}
                                groupID={''}
                            />
                        }
                        <Card
                            expanded={true}
                            className={'console'}
                        >
                            <Card.Header>
                                <TitleAndButtonCardHeader
                                    title={
                                        <FormattedMessage
                                            id='admin.data_retention.custom_policy.channel_selector.title'
                                            defaultMessage='Assigned channels'
                                        />
                                    }
                                    subtitle={
                                        <FormattedMessage
                                            id='admin.data_retention.custom_policy.channel_selector.subTitle'
                                            defaultMessage='Add channels that will follow this retention policy.'
                                        />
                                    }
                                    buttonText={
                                        <FormattedMessage
                                            id='admin.data_retention.custom_policy.channel_selector.addChannels'
                                            defaultMessage='Add channels'
                                        />
                                    }
                                    onClick={this.openAddChannel}
                                />
                            </Card.Header>
                            <Card.Body>
                                <ChannelsList />
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}