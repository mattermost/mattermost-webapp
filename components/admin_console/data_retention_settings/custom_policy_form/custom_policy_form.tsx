// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {DataRetentionCustomPolicy} from 'mattermost-redux/types/data_retention';
import {Team} from 'mattermost-redux/types/teams';

import * as Utils from 'utils/utils.jsx';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import TitleAndButtonCardHeader from 'components/card/title_and_button_card_header/title_and_button_card_header';
import Card from 'components/card/card';
import ChannelsList from 'components/admin_console/team_channel_settings/channel/list';
import Input from 'components/input';
import DropdownInput from 'components/dropdown_input';
import TeamList from 'components/admin_console/team_channel_settings/team/list';
import TeamSelectorModal from 'components/team_selector_modal';
import ChannelSelectorModal from 'components/channel_selector_modal';
import DropdownInputTransformer from 'components/widgets/inputs/dropdown_input_transformer';

type Props = {
    policyId?: string;
    policy?: DataRetentionCustomPolicy;
    actions: {
        fetchPolicy: (id: string) => Promise<{ data: DataRetentionCustomPolicy }>;
        fetchPolicyTeams: (id: string) => Promise<{ data: Team[] }>;
    };
};

type State = {
    addTeamOpen: boolean;
    addChannelOpen: boolean;
    messageRetentionInputValue: string;
    messageRetentionDropdownValue: any;
}

export default class CustomPolicyForm extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            addTeamOpen: false,
            addChannelOpen: false,
            messageRetentionInputValue: '',
            messageRetentionDropdownValue: {value: 'forever', label: 'Keep Forever'},
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
        console.log(this.props.policyId);
        console.log('mounting...');
        if (this.props.policyId) {
            await this.props.actions.fetchPolicy(this.props.policyId);
            await this.props.actions.fetchPolicyTeams(this.props.policyId);
        }
    }

    render = () => {
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
                                    team_ids={['zk4b88wn13r8xpg1aowk54zb3w']}
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