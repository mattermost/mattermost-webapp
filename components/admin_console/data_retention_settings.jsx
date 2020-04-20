// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {JobTypes} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import ConfirmModal from 'components/confirm_modal';

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

    renderConfirmModal = () => {
        const title = (
            <FormattedMessage
                id='admin.data_retention.confirmChangesModal.title'
                defaultMessage='Confirm data retention policy'
            />
        );

        const messageList = [];

        if (this.state.enableMessageDeletion === 'true') {
            messageList.push(
                <FormattedMessage
                    id='admin.data_retention.confirmChangesModal.description.itemMessageDeletion'
                    defaultMessage='All messages will be permanently deleted after {days} days.'
                    values={{
                        days: (
                            <strong>
                                {this.state.messageRetentionDays}
                            </strong>
                        ),
                    }}
                />,
            );
        } else {
            messageList.push(
                <FormattedMessage
                    id='admin.data_retention.confirmChangesModal.description.itemMessageIndefinite'
                    defaultMessage='All messages will be retained indefinitely.'
                />,
            );
        }

        if (this.state.enableFileDeletion === 'true') {
            messageList.push(
                <FormattedMessage
                    id='admin.data_retention.confirmChangesModal.description.itemFileDeletion'
                    defaultMessage='All files will be permanently deleted after {days} days.'
                    values={{
                        days: (
                            <strong>
                                {this.state.fileRetentionDays}
                            </strong>
                        ),
                    }}
                />,
            );
        } else {
            messageList.push(
                <FormattedMessage
                    id='admin.data_retention.confirmChangesModal.description.itemFileIndefinite'
                    defaultMessage='All files will be retained indefinitely.'
                />,
            );
        }

        const message = (
            <div>
                <p>
                    <FormattedMessage
                        id='admin.data_retention.confirmChangesModal.description'
                        defaultMessage='Are you sure you want to apply the following data retention policy:'
                    />
                </p>
                <ul>
                    {messageList.map((item, index) => {
                        return <li key={index}>{item}</li>;
                    })}
                </ul>
                <p>
                    <FormattedMessage
                        id='admin.data_retention.confirmChangesModal.clarification'
                        defaultMessage='Once deleted, messages and files cannot be retrieved.'
                    />
                </p>
            </div>
        );

        const confirmButton = (
            <FormattedMessage
                id='admin.data_retention.confirmChangesModal.confirm'
                defaultMessage='Confirm Settings'
            />
        );

        return (
            <ConfirmModal
                show={this.state.showConfirmModal}
                title={title}
                message={message}
                confirmButtonText={confirmButton}
                onConfirm={this.handleSaveConfirmed}
                onCancel={this.handleSaveCanceled}
            />
        );
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.data_retention.title'
                defaultMessage='Data Retention Policy'
            />
        );
    }

    renderSettings = () => {
        const enableMessageDeletionOptions = [
            {value: 'false', text: Utils.localizeMessage('admin.data_retention.keepMessagesIndefinitely', 'Keep all messages indefinitely')},
            {value: 'true', text: Utils.localizeMessage('admin.data_retention.keepMessageForTime', 'Keep messages for a set amount of time')},
        ];

        const enableFileDeletionOptions = [
            {value: 'false', text: Utils.localizeMessage('admin.data_retention.keepFilesIndefinitely', 'Keep all files indefinitely')},
            {value: 'true', text: Utils.localizeMessage('admin.data_retention.keepFilesForTime', 'Keep files for a set amount of time')},
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
                    setByEnv={this.isSetByEnv('DataRetentionSettings.MessageRetentionDays')}
                    disabled={this.props.isDisabled}
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
                    setByEnv={this.isSetByEnv('DataRetentionSettings.FileRetentionDays')}
                    disabled={this.props.isDisabled}
                />
            );
        }

        const confirmModal = this.renderConfirmModal();

        return (
            <SettingsGroup>
                {confirmModal}
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
                                ),
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
                    setByEnv={this.isSetByEnv('DataRetentionSettings.EnableMessageDeletion')}
                    disabled={this.props.isDisabled}
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
                    setByEnv={this.isSetByEnv('DataRetentionSettings.EnableFileDeletion')}
                    disabled={this.props.isDisabled}
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
                    setByEnv={this.isSetByEnv('DataRetentionSettings.DeletionJobStartTime')}
                    disabled={this.props.isDisabled}
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
