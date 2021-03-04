// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {AdminConfig} from 'mattermost-redux/types/config';
import {DataRetentionCustomPolicies, DataRetentionCustomPolicy} from 'mattermost-redux/types/data_retention';

import {JobTypes} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';
import Card from 'components/card/card';
import TitleAndButtonCardHeader from 'components/card/title_and_button_card_header/title_and_button_card_header';

import AdminSettings, {BaseProps, BaseState} from 'components/admin_console/admin_settings';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import DropdownSetting from 'components/admin_console/dropdown_setting.jsx';
import JobsTable from 'components/admin_console/jobs';
import SettingsGroup from 'components/admin_console/settings_group.jsx';
import TextSetting from 'components/admin_console/text_setting';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import Menu from 'components/widgets/menu/menu';
import {browserHistory} from 'utils/browser_history';

type Props = {
    config: AdminConfig;
    customPolicies: DataRetentionCustomPolicies;
    actions: {
        getDataRetentionCustomPolicies: () => Promise<{ data: DataRetentionCustomPolicies }>;
    };
};

type State = {
    enableMessageDeletion: boolean;
    enableFileDeletion: boolean;
    customPoliciesLoading: boolean;
}

export default class DataRetentionSettings extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            enableMessageDeletion: true,
            enableFileDeletion: true,
            customPoliciesLoading: true,
        }
    }
   

    getGlobalPolicyColumns = () => {
        return [
            {
                name: (
                    <FormattedMessage
                        id='admin.data_retention.globalPoliciesTable.description'
                        defaultMessage='Description'
                    />
                ),
                field: 'description',
            },
            {
                name: (
                    <FormattedMessage
                        id='admin.data_retention.globalPoliciesTable.channelMessages'
                        defaultMessage='Channel messages'
                    />
                ),
                field: 'channel_messages',
            },
            {
                name: (
                    <FormattedMessage
                        id='admin.data_retention.globalPoliciesTable.files'
                        defaultMessage='Files'
                    />
                ),
                field: 'files',
            },
            {
                name: '',
                field: 'actions',
                className: 'actionIcon',
            },
        ];
    }
    getCustomPolicyColumns = () => {
        return [
            {
                name: (
                    <FormattedMessage
                        id='admin.data_retention.customPoliciesTable.description'
                        defaultMessage='Description'
                    />
                ),
                field: 'description',
            },
            {
                name: (
                    <FormattedMessage
                        id='admin.data_retention.customPoliciesTable.channelMessages'
                        defaultMessage='Channel messages'
                    />
                ),
                field: 'channel_messages',
            },
            {
                name: (
                    <FormattedMessage
                        id='admin.data_retention.customPoliciesTable.appliedTo'
                        defaultMessage='Applied to'
                    />
                ),
                field: 'applied_to',
            },
            {
                name: '',
                field: 'actions',
                className: 'actionIcon',
            },
        ];
    }
    getGlobalPolicyRows = () => {
        const { DataRetentionSettings } = this.props.config;
            return [{
                cells: {
                    description: 'Applies to all teams and channels, but does not apply to custom retention policies.',
                    channel_messages: DataRetentionSettings.EnableMessageDeletion ? `${DataRetentionSettings.MessageRetentionDays} days` : 'Keep Forever',
                    files: DataRetentionSettings.EnableFileDeletion ? `${DataRetentionSettings.FileRetentionDays} days` : 'Keep Forever',
                    actions: (
                        <MenuWrapper
                            isDisabled={false}
                        >
                            <div className='text-right'>
                                <a>
                                    <i className='icon icon-dots-vertical'/>
                                </a>
                            </div>
                            <Menu
                                openLeft={false}
                                openUp={false}
                                ariaLabel={'User Actions Menu'}
                            >
                                <Menu.ItemAction
                                    show={true}
                                    onClick={() => {
                                        browserHistory.push(`/admin_console/compliance/data_retention/global_policy`);
                                    }}
                                    text={'Edit'}
                                    disabled={false}
                                />
                            </Menu>
                        </MenuWrapper>
                    ),
                },
                // onClick: () => {
                //     browserHistory.push(`/admin_console/compliance/global_data_retention`);
                // }
            }];
    }
    getChannelAndTeamCounts = (policy: DataRetentionCustomPolicy): string => {
        if (policy.channel_count === 0 && policy.team_count === 0) {
            return 'N/A';
        }
        let appliedTo = '';
        if (policy.team_count > 0) {
            appliedTo = `${policy.team_count} team`;
            if (policy.team_count > 1) {
                appliedTo += `s`;
            }
        }
        if (policy.channel_count > 0 && policy.team_count > 0) {
            appliedTo += `, `;
        }
        if (policy.channel_count > 0) {
            appliedTo += `${policy.channel_count} channel`;
            if (policy.channel_count > 1) {
                appliedTo += `s`;
            }
        }
        
        return appliedTo;
    }
    getCustomPolicyRows = (): Row[] => {
        return Object.values(this.props.customPolicies).map((policy: any) => {
            return {
                cells: {
                    description: policy.display_name,
                    channel_messages: `${policy.post_duration} days`,
                    applied_to: this.getChannelAndTeamCounts(policy),
                    actions: (
                        <MenuWrapper
                            isDisabled={false}
                        >
                            <div className='text-right'>
                                <a>
                                    <i className='icon icon-dots-vertical'/>
                                </a>
                            </div>
                            <Menu
                                openLeft={true}
                                openUp={false}
                                ariaLabel={'User Actions Menu'}
                            >
                                <Menu.ItemAction
                                    show={true}
                                    onClick={() => {
                                        browserHistory.push(`/admin_console/compliance/data_retention/custom_policy/${policy.id}`);
                                    }}
                                    text={'Edit'}
                                    disabled={false}
                                />
                                <Menu.ItemAction
                                    show={true}
                                    onClick={() => {}}
                                    text={'Delete'}
                                    disabled={false}
                                />
                            </Menu>
                        </MenuWrapper>
                    ),
                },
            };
        });
    };

    componentDidMount = async () => {
        const {actions} = this.props;
        await actions.getDataRetentionCustomPolicies();
        this.setState({customPoliciesLoading: false});
    }

    render = () => {

        return (
            <div className='wrapper--fixed DataRetentionSettings'>
                <div className='admin-console__header'>
                    <FormattedMessage
                        id='admin.data_retention.title'
                        defaultMessage='Data Retention Policy'
                    />
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
                                            id='admin.data_retention.globalPolicy.title'
                                            defaultMessage='Global retention policy'
                                        />
                                    }
                                    subtitle={
                                        <FormattedMessage
                                            id='admin.data_retention.globalPolicy.subTitle'
                                            defaultMessage='Keep messages and files for a set amount of time.'
                                        />
                                    }
                                />
                            </Card.Header>
                            <Card.Body>
                                <DataGrid
                                    columns={this.getGlobalPolicyColumns()}
                                    rows={this.getGlobalPolicyRows()}
                                    loading={false}
                                    page={0}
                                    nextPage={() => {}}
                                    previousPage={() => {}}
                                    startCount={1}
                                    endCount={4}
                                    total={0}
                                    className={'customTable'}
                                />
                            </Card.Body>
                        </Card>
                        <Card
                            expanded={true}
                            className={'console'}
                        >
                            <Card.Header>
                                <TitleAndButtonCardHeader
                                    title={
                                        <FormattedMessage
                                            id='admin.data_retention.customPolicies.title'
                                            defaultMessage='Custom retention policies'
                                        />
                                    }
                                    subtitle={
                                        <FormattedMessage
                                            id='admin.data_retention.customPolicies.subTitle'
                                            defaultMessage='Customize how long specific teams and channels will keep messages.'
                                        />
                                    }
                                    buttonText={
                                        <FormattedMessage
                                            id='admin.data_retention.customPolicies.addPolicy'
                                            defaultMessage='Add policy'
                                        />
                                    }
                                    onClick={() => {
                                        browserHistory.push(`/admin_console/compliance/data_retention/custom_policy`);
                                    }}
                                />
                            </Card.Header>
                            <Card.Body>
                                <DataGrid
                                    columns={this.getCustomPolicyColumns()}
                                    rows={this.getCustomPolicyRows()}
                                    loading={this.state.customPoliciesLoading}
                                    page={0}
                                    nextPage={() => {}}
                                    previousPage={() => {}}
                                    startCount={1}
                                    endCount={4}
                                    total={0}
                                    className={'customTable'}
                                />
                            </Card.Body>
                        </Card>
                        <Card
                            expanded={true}
                            className={'console'}
                        >
                            <Card.Header>
                                <TitleAndButtonCardHeader
                                    title={
                                        <FormattedMessage
                                            id='admin.data_retention.jobCreation.title'
                                            defaultMessage='Policy log'
                                        />
                                    }
                                    subtitle={
                                        <FormattedMessage
                                            id='admin.data_retention.jobCreation.subTitle'
                                            defaultMessage='Daily log of messages and files removed based on the policies defined above.'
                                        />
                                    }
                                />
                            </Card.Header>
                            <Card.Body>
                                <JobsTable
                                    jobType={JobTypes.DATA_RETENTION}
                                    disabled={this.state.enableMessageDeletion !== 'true' && this.state.enableFileDeletion !== 'true'}
                                    createJobButtonText={
                                        <FormattedMessage
                                            id='admin.data_retention.createJob.title'
                                            defaultMessage='Run Deletion Job Now'
                                        />
                                    }
                                    createJobHelpText={
                                        <FormattedMessage
                                            id='admin.data_retention.createJob.help'
                                            defaultMessage='Initiates a Data Retention deletion job immediately.'
                                        />
                                    }
                                />
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}
