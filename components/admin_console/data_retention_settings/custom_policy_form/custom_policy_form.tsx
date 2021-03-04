// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Link} from 'react-router-dom';

import {
    DataRetentionCustomPolicy, 
    CreateDataRetentionCustomPolicy, 
    PatchDataRetentionCustomPolicy, 
    PatchDataRetentionCustomPolicyTeams, 
    PatchDataRetentionCustomPolicyChannels
} from 'mattermost-redux/types/data_retention';
import {Team, TeamSearchOpts} from 'mattermost-redux/types/teams';
import {IDMappedObjects} from 'mattermost-redux/types/utilities';

import * as Utils from 'utils/utils.jsx';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import TitleAndButtonCardHeader from 'components/card/title_and_button_card_header/title_and_button_card_header';
import Card from 'components/card/card';
import BlockableLink from 'components/admin_console/blockable_link';
import Input from 'components/input';
import TeamSelectorModal from 'components/team_selector_modal';
import ChannelSelectorModal from 'components/channel_selector_modal';
import DropdownInputTransformer from 'components/widgets/inputs/dropdown_input_transformer';
import SaveButton from 'components/save_button';
import TeamList from 'components/admin_console/data_retention_settings/team_list';
import ChannelList from 'components/admin_console/data_retention_settings/channel_list';

import './custom_policy_form.scss';
import { ChannelWithTeamData } from 'mattermost-redux/types/channels';
import { browserHistory } from 'utils/browser_history';

type Props = {
    policyId?: string;
    policy?: DataRetentionCustomPolicy;
    actions: {
        fetchPolicy: (id: string) => Promise<{ data: DataRetentionCustomPolicy }>;
        fetchPolicyTeams: (id: string, page: number, perPage: number) => Promise<{ data: Team[] }>;
        createDataRetentionCustomPolicy: (policy: CreateDataRetentionCustomPolicy) => Promise<{ data: DataRetentionCustomPolicy }>;
        updateDataRetentionCustomPolicy: (id: string, policy: PatchDataRetentionCustomPolicy) => Promise<{ data: DataRetentionCustomPolicy }>;
        addDataRetentionCustomPolicyTeams: (id: string, policy: PatchDataRetentionCustomPolicyTeams) => Promise<{ data: Team[] }>;
        removeDataRetentionCustomPolicyTeams: (id: string, policy: PatchDataRetentionCustomPolicyTeams) => Promise<{ data: Team[] }>;
        addDataRetentionCustomPolicyChannels: (id: string, policy: PatchDataRetentionCustomPolicyChannels) => Promise<{ data: ChannelWithTeamData[] }>;
        removeDataRetentionCustomPolicyChannels: (id: string, policy: PatchDataRetentionCustomPolicyChannels) => Promise<{ data: ChannelWithTeamData[] }>;
    };
    teams?: Team[];
    setNavigationBlocked: () => void;
};

type State = {
    policyName: string | undefined;
    addTeamOpen: boolean;
    addChannelOpen: boolean;
    messageRetentionInputValue: string;
    messageRetentionDropdownValue: any;
    teamsTerm: string;
    teamsSearchTotal: number;
    teamsSearchErrored: boolean;
    teamsFilters: TeamSearchOpts;
    removedTeamsCount: number;
    removedTeams: IDMappedObjects<Team>;
    newTeams: IDMappedObjects<Team>;
    removedChannelsCount: number;
    removedChannels: IDMappedObjects<ChannelWithTeamData>;
    newChannels: IDMappedObjects<ChannelWithTeamData>;
    saveNeeded: boolean;
    saving: boolean;
}

export default class CustomPolicyForm extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            policyName: '',
            addTeamOpen: false,
            addChannelOpen: false,
            messageRetentionInputValue: this.getMessageRetentionDefaultInputValue(),
            messageRetentionDropdownValue: this.getMessageRetentionDefaultDropdownValue(),
            teamsTerm: '',
            teamsSearchTotal: 0,
            teamsSearchErrored: false,
            teamsFilters: {},
            removedTeamsCount: 0,
            removedTeams: {},
            newTeams: {},
            removedChannelsCount: 0,
            removedChannels: {},
            newChannels: {},
            saveNeeded: false,
            saving: false,
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
    getMessageRetentionDefaultInputValue = (): string => {
        if (!this.props.policy || Object.keys(this.props.policy).length === 0 || (this.props.policy && this.props.policy.post_duration === -1)) {
            return '';
        }
        if (this.props.policy && this.props.policy.post_duration % 365 === 0) {
            return (this.props.policy.post_duration / 365).toString();
        } 
        return this.props.policy.post_duration.toString();
    }
    getMessageRetentionDefaultDropdownValue = () => {
        if (!this.props.policyId || (this.props.policy && this.props.policy.post_duration === -1)) {
            return {value: 'forever', label: <div><i className='icon icon-infinity option-icon'/><span>Keep Forever</span></div>};
        }
        if (this.props.policy && this.props.policy.post_duration % 365 === 0) {
            return {value: 'years', label: 'Years'};
        }
        return {value: 'days', label: 'Days'};
    }

    componentDidMount = async () => {
        if (this.props.policyId) {
            await this.props.actions.fetchPolicy(this.props.policyId);
            this.setState({ 
                policyName: this.props.policy?.display_name,
                messageRetentionInputValue: this.getMessageRetentionDefaultInputValue(), 
                messageRetentionDropdownValue: this.getMessageRetentionDefaultDropdownValue() 
            });
        }
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

    addToNewChannels = (channels: ChannelWithTeamData[]) => {
        let {removedChannelsCount} = this.state;
        const {newChannels, removedChannels} = this.state;
        channels.forEach((channel: ChannelWithTeamData) => {
            if (removedChannels[channel.id]?.id === channel.id) {
                delete removedChannels[channel.id];
                removedChannelsCount -= 1;
            } else {
                newChannels[channel.id] = channel;
            }
        });
        this.setState({newChannels: {...newChannels}, removedChannels: {...removedChannels}, removedChannelsCount, saveNeeded: true});
        this.props.setNavigationBlocked();
    }

    addToRemovedChannels = (channel: ChannelWithTeamData) => {
        let {removedChannelsCount} = this.state;
        const {newChannels, removedChannels} = this.state;
        if (newChannels[channel.id]?.id === channel.id) {
            delete newChannels[channel.id];
        } else if (removedChannels[channel.id]?.id !== channel.id) {
            removedChannelsCount += 1;
            removedChannels[channel.id] = channel;
        }
        this.setState({removedChannels: {...removedChannels}, newChannels: {...newChannels}, removedChannelsCount, saveNeeded: true});
        this.props.setNavigationBlocked();
    }
    handleSubmit = async () => {
        const {policyName, messageRetentionInputValue, messageRetentionDropdownValue, newTeams, removedTeams, newChannels, removedChannels, saving} = this.state;
        const {policyId} = this.props;
        const {
            updateDataRetentionCustomPolicy,
            addDataRetentionCustomPolicyTeams,
            removeDataRetentionCustomPolicyTeams,
            addDataRetentionCustomPolicyChannels,
            removeDataRetentionCustomPolicyChannels,
        } = this.props.actions;

        this.setState({saving: true});

        const teamsToAdd = Object.keys(newTeams);
        const teamsToRemove = Object.keys(removedTeams);
        const channelsToAdd = Object.keys(newChannels);
        const channelsToRemove = Object.keys(removedChannels);

        if (policyId) {
            const policyInfo = {
                display_name: policyName,
                post_duration: parseInt(messageRetentionInputValue),
            }
            let actions: any[] = [updateDataRetentionCustomPolicy(policyId, policyInfo)];
            if (teamsToAdd) {
                actions.push(addDataRetentionCustomPolicyTeams(policyId, teamsToAdd));
            }
            if (teamsToRemove) {
                actions.push(removeDataRetentionCustomPolicyTeams(policyId, teamsToRemove));
            }
            if (channelsToAdd) {
                actions.push(addDataRetentionCustomPolicyChannels(policyId, channelsToAdd));
            }
            if (channelsToRemove) {
                actions.push(removeDataRetentionCustomPolicyChannels(policyId, channelsToRemove));
            }
            const result = await Promise.all([actions]);
            if (!result.error) {
                browserHistory.push(`/admin_console/compliance/data_retention`);
            }
        } else {
            const newPolicy = {
                display_name: policyName,
                post_duration: parseInt(messageRetentionInputValue),
                team_ids: teamsToAdd,
                channel_ids: channelsToAdd,
            }
            const result = await this.props.actions.createDataRetentionCustomPolicy(newPolicy);
            if (!result.error) {
                browserHistory.push(`/admin_console/compliance/data_retention`);
            }
        }
    }
    
    render = () => {

        return (
            <div className='wrapper--fixed DataRetentionSettings'>
                <div className='admin-console__header with-back'>
                    <div>
                        <BlockableLink
                            to='/admin_console/compliance/data_retention'
                            className='fa fa-angle-left back'
                        />
                        <FormattedMessage
                            id='admin.data_retention.customTitle'
                            defaultMessage='Custom Retention Policy'
                        />
                    </div>
                </div>
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
                                <div
                                    className='custom_policy_fields'
                                >
                                    <Input
                                        name='policyName'
                                        type='text'
                                        value={this.state.policyName}
                                        onChange={(e) => {
                                            this.setState({ policyName: e.target.value, saveNeeded: true });
                                        }}
                                        placeholder={Utils.localizeMessage('admin.data_retention.custom_policy.form.input', 'Policy name')}
                                        required={true}
                                    />
                                    <DropdownInputTransformer
                                        onDropdownChange={(value) => {
                                            if (this.state.messageRetentionDropdownValue.value !== value.value) {
                                                this.setState({ messageRetentionDropdownValue: value, saveNeeded: true });
                                            }
                                        }}
                                        onInputChange={(e) => {
                                            this.setState({ messageRetentionInputValue: e.target.value, saveNeeded: true });
                                        }}
                                        value={this.state.messageRetentionDropdownValue}
                                        inputValue={this.state.messageRetentionInputValue}
                                        width={380}
                                        exceptionToInput={['forever']}
                                        defaultValue={this.getMessageRetentionDefaultDropdownValue()}
                                        options={[{value: 'days', label: 'Days'}, {value: 'years', label: 'Years'}, {value: 'forever', label: <div><i className='icon icon-infinity option-icon'/><span>Keep Forever</span></div>}]}
                                        legend={Utils.localizeMessage('admin.data_retention.form.channelAndDirectMessageRetention', 'Channel & direct message retention')}
                                        placeholder={Utils.localizeMessage('admin.data_retention.form.channelAndDirectMessageRetention', 'Channel & direct message retention')}
                                        name={'channel_message_retention'}
                                    />
                                </div>
                                
                            </Card.Body>
                        </Card>
                        {this.state.addTeamOpen &&
                            <TeamSelectorModal
                                onModalDismissed={this.closeAddTeam}
                                onTeamsSelected={(teams) => {
                                    this.addToNewTeams(teams);
                                }}
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
                                <TeamList
                                    onRemoveCallback={this.addToRemovedTeams}
                                    onAddCallback={this.addToNewTeams}
                                    teamsToRemove={this.state.removedTeams}
                                    teamsToAdd={this.state.newTeams}
                                    policyId={this.props.policyId}
                                />
                            </Card.Body>
                        </Card>
                        {this.state.addChannelOpen &&
                            <ChannelSelectorModal
                                onModalDismissed={this.closeAddChannel}
                                onChannelsSelected={(channels) => {
                                    this.addToNewChannels(channels);
                                }}
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
                                <ChannelList
                                    onRemoveCallback={this.addToRemovedChannels}
                                    onAddCallback={this.addToNewChannels}
                                    channelsToRemove={this.state.removedChannels}
                                    channelsToAdd={this.state.newChannels}
                                    policyId={this.props.policyId}
                                />
                            </Card.Body>
                        </Card>
                    </div>
                </div>
                <div className='admin-console-save'>
                    <SaveButton
                        saving={this.state.saving}
                        disabled={!this.state.saveNeeded}
                        onClick={this.handleSubmit}
                        defaultMessage={(
                            <FormattedMessage
                                id='admin.data_retention.custom_policy.save'
                                defaultMessage='Save'
                            />
                        )}
                    />
                    <BlockableLink
                        className='cancel-button'
                        to='/admin_console/compliance/data_retention'
                    >
                        <FormattedMessage
                            id='admin.data_retention.custom_policy.cancel'
                            defaultMessage='Cancel'
                        />
                    </BlockableLink>
                </div>
            </div>
        );
    }
}