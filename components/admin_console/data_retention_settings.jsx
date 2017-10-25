// Copyright (c) 2017-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {JobTypes} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import AdminSettings from './admin_settings.jsx';
import DropdownSetting from './dropdown_setting.jsx';
import JobsTable from './jobs';
import SettingsGroup from './settings_group.jsx';
import TextSetting from './text_setting.jsx';

export default class DataRetentionSettings extends AdminSettings {
    constructor(props) {
        super(props);

        this.getConfigFromState = this.getConfigFromState.bind(this);

        this.renderSettings = this.renderSettings.bind(this);
    }

    getConfigFromState(config) {
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
            deletionJobStartTime: config.DataRetentionSettings.DeletionJobStartTime
        };
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.data_retention.title'
                defaultMessage='Data Retention Policy (Beta)'
            />
        );
    }

    renderSettings() {
        const enableMessageDeletionOptions = [
            {value: 'false', text: Utils.localizeMessage('admin.data_retention.keepMessagesIndefinitely', 'Keep all messages indefinitely')},
            {value: 'true', text: Utils.localizeMessage('admin.data_retention.keepMessageForTime', 'Keep messages for a set amount of time')}
        ];

        const enableFileDeletionOptions = [
            {value: 'false', text: Utils.localizeMessage('admin.data_retention.keepFilesIndefinitely', 'Keep all files indefinitely')},
            {value: 'true', text: Utils.localizeMessage('admin.data_retention.keepFilesForTime', 'Keep files for a set amount of time')}
        ];

        let messageRetentionDaysSetting = '';
        if (this.state.enableMessageDeletion === 'true') {
            messageRetentionDaysSetting = (
                <TextSetting
                    id='messageRetentionDays'
                    label={<span/>}
                    placeholder={Utils.localizeMessage('admin.data_retention.messageRetentionDays.example', 'E.g.: "60"')}
                    helpText={
                        <FormattedMessage
                            id='admin.data_retention.messageRetentionDays.description'
                            defaultMessage='Set how many days messages are kept in Mattermost. Messages, including file attachments older than the duration you set will be deleted nightly. The minimum time is one day.'
                        />
                    }
                    value={this.state.messageRetentionDays}
                    onChange={this.handleChange}
                />
            );
        }

        let fileRetentionDaysSetting = '';
        if (this.state.enableFileDeletion === 'true') {
            fileRetentionDaysSetting = (
                <TextSetting
                    id='fileRetentionDays'
                    label={<span/>}
                    placeholder={Utils.localizeMessage('admin.data_retention.fileRetentionDays.example', 'E.g.: "60"')}
                    helpText={
                        <FormattedMessage
                            id='admin.data_retention.fileRetentionDays.description'
                            defaultMessage='Set how many days file uploads are kept in Mattermost. Files older than the duration you set will be deleted nightly. The minimum time is one day.'
                        />
                    }
                    value={this.state.fileRetentionDays}
                    onChange={this.handleChange}
                />
            );
        }

        return (
            <SettingsGroup>
                <div className='banner'>
                    <div className='banner__content'>
                        <FormattedMessage
                            id='admin.data_retention.note.description'
                            defaultMessage='Caution: Once a message or a file is deleted, the action is irreversible. Please be careful when setting up a custom data retention policy. See {documentationLink} to learn more.'
                            values={{
                                documentationLink: (
                                    <a
                                        href='https://about.mattermost.com/default-dataretention-documentation/'
                                        rel='noopener noreferrer'
                                        target='_blank'
                                    >
                                        <FormattedMessage
                                            id='admin.data_retention.note.description.documentationLinkText'
                                            defaultMessage='documentation'
                                        />
                                    </a>
                                )
                            }}
                        />
                    </div>
                </div>
                <DropdownSetting
                    id='enableMessageDeletion'
                    values={enableMessageDeletionOptions}
                    label={
                        <FormattedMessage
                            id='admin.data_retention.enableMessageDeletion.title'
                            defaultMessage='Message Retention:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.data_retention.enableMessageDeletion.description'
                            defaultMessage='Set how long Mattermost keeps messages in channels and direct messages.'
                        />
                    }
                    value={this.state.enableMessageDeletion}
                    onChange={this.handleChange}
                />
                {messageRetentionDaysSetting}
                <DropdownSetting
                    id='enableFileDeletion'
                    values={enableFileDeletionOptions}
                    label={
                        <FormattedMessage
                            id='admin.data_retention.enableFileDeletion.title'
                            defaultMessage='File Retention:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.data_retention.enableFileDeletion.description'
                            defaultMessage='Set how long Mattermost keeps file uploads in channels and direct messages.'
                        />
                    }
                    value={this.state.enableFileDeletion}
                    onChange={this.handleChange}
                />
                {fileRetentionDaysSetting}
                <TextSetting
                    id='deletionJobStartTime'
                    label={
                        <FormattedMessage
                            id='admin.data_retention.deletionJobStartTime.title'
                            defaultMessage='Data Deletion Time:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.data_retention.deletionJobStartTime.example', 'E.g.: "02:00"')}
                    helpText={
                        <FormattedMessage
                            id='admin.data_retention.deletionJobStartTime.description'
                            defaultMessage='Set the start time of the daily scheduled data retention job. Choose a time when fewer people are using your system. Must be a 24-hour time stamp in the form HH:MM.'
                        />
                    }
                    value={this.state.deletionJobStartTime}
                    onChange={this.handleChange}
                />
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
            </SettingsGroup>
        );
    }
}
