// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {JobTypes} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import DataGrid, {Row, Column} from 'components/admin_console/data_grid/data_grid';
import Card from 'components/card/card';
import TitleAndButtonCardHeader from 'components/card/title_and_button_card_header/title_and_button_card_header';

import AdminSettings from './admin_settings';
import DropdownSetting from './dropdown_setting.jsx';
import JobsTable from './jobs';
import SettingsGroup from './settings_group.jsx';
import TextSetting from './text_setting';

export default class DataRetentionSettings extends AdminSettings {
    getConfigFromState = (config) => {
        config.DataRetentionSettings.EnableMessageDeletion = this.state.enableMessageDeletion === 'true';
        config.DataRetentionSettings.EnableFileDeletion = this.state.enableFileDeletion === 'true';
        config.DataRetentionSettings.MessageRetentionDays = parseInt(this.state.messageRetentionDays, 10);
        config.DataRetentionSettings.FileRetentionDays = parseInt(this.state.fileRetentionDays, 10);
        config.DataRetentionSettings.DeletionJobStartTime = this.state.deletionJobStartTime;

        return config;
    }

    getStateFromConfig(config) {
        return {
            enableMessageDeletion: String(config.DataRetentionSettings.EnableMessageDeletion),
            enableFileDeletion: String(config.DataRetentionSettings.EnableFileDeletion),
            messageRetentionDays: config.DataRetentionSettings.MessageRetentionDays,
            fileRetentionDays: config.DataRetentionSettings.FileRetentionDays,
            deletionJobStartTime: config.DataRetentionSettings.DeletionJobStartTime,
            showConfirmModal: false,
        };
    }

    handleSubmit = (e) => {
        e.preventDefault();

        this.setState({showConfirmModal: true});
    };

    handleSaveConfirmed = () => {
        this.setState({showConfirmModal: false});

        this.doSubmit();
    };

    handleSaveCanceled = () => {
        this.setState({showConfirmModal: false});
    };


    renderTitle() {
        return (
            <FormattedMessage
                id='admin.data_retention.title'
                defaultMessage='Data Retention Policy'
            />
        );
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
                customClass: 'Table__table-icon'
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
                customClass: 'Table__table-icon'
            },
        ];
    }

    componentDidMount = () => {

    }

    renderSettings = () => {

        return (
            <SettingsGroup>
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
                            onClick={() => {}}
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
                
            </SettingsGroup>
        );
    }
}
