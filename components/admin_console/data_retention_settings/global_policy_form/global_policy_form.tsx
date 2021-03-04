// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import {AdminConfig} from 'mattermost-redux/types/config';

import {JobTypes} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import AdminSettings, {BaseProps, BaseState} from 'components/admin_console/admin_settings';
import SettingsGroup from 'components/admin_console/settings_group.jsx';
import Card from 'components/card/card';
import BlockableLink from 'components/admin_console/blockable_link';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import {browserHistory} from 'utils/browser_history';
import DropdownInputTransformer from 'components/widgets/inputs/dropdown_input_transformer';

import './global_policy_form.scss';

type Props = BaseProps & {
    config: AdminConfig;
    headerClassName: string;
};

type State = BaseState & {
    messageRetentionDropdownValue: any;
    messageRetentionInputValue: string;
    fileRetentionDropdownValue: any;
    fileRetentionInputValue: string;
    saveNeeded: boolean;
    saving: boolean;
    serverError: JSX.Element | string | null;
    errorTooltip: boolean;
    
}

export default class GlobalPolicyForm extends AdminSettings<Props, State> {

    getConfigFromState = (config: Props['config']) => {
        config.DataRetentionSettings.EnableMessageDeletion = this.state.enableMessageDeletion === 'true';
        config.DataRetentionSettings.EnableFileDeletion = this.state.enableFileDeletion === 'true';
        config.DataRetentionSettings.MessageRetentionDays = parseInt(this.state.messageRetentionDays, 10);
        config.DataRetentionSettings.FileRetentionDays = parseInt(this.state.fileRetentionDays, 10);
        return config;
    }

    getStateFromConfig(config: Props['config']) {
        return {
            enableMessageDeletion: String(config.DataRetentionSettings.EnableMessageDeletion),
            enableFileDeletion: String(config.DataRetentionSettings.EnableFileDeletion),
            messageRetentionDays: config.DataRetentionSettings.MessageRetentionDays,
            fileRetentionDays: config.DataRetentionSettings.FileRetentionDays,
            messageRetentionDropdownValue: !config.DataRetentionSettings.EnableMessageDeletion ? {value: 'forever', label: <div><i className='icon icon-infinity option-icon'/><span>Keep Forever</span></div>} : config.DataRetentionSettings.MessageRetentionDays % 365 === 0 ? {value: 'years', label: 'Years'} : {value: 'days', label: 'Days'},
            messageRetentionInputValue: !config.DataRetentionSettings.EnableMessageDeletion ? '' : config.DataRetentionSettings.MessageRetentionDays % 365 === 0 ? config.DataRetentionSettings.MessageRetentionDays / 365 : config.DataRetentionSettings.MessageRetentionDays,
            fileRetentionDropdownValue: !config.DataRetentionSettings.EnableFileDeletion ? {value: 'forever', label: <div><i className='icon icon-infinity option-icon'/><span>Keep Forever</span></div>} : config.DataRetentionSettings.FileRetentionDays % 365 === 0 ? {value: 'years', label: 'Years'} : {value: 'days', label: 'Days'},
            fileRetentionInputValue: !config.DataRetentionSettings.EnableFileDeletion ? '' : config.DataRetentionSettings.FileRetentionDays % 365 === 0 ? config.DataRetentionSettings.FileRetentionDays / 365 : config.DataRetentionSettings.FileRetentionDays,
        };
    }
    renderTitle() {
        return (
            <div>
                <BlockableLink
                    to='/admin_console/compliance/data_retention'
                    className='fa fa-angle-left back'
                />
                <FormattedMessage
                    id='admin.data_retention.globalPolicyTitle'
                    defaultMessage='Global Retention Policy'
                />
            </div>
        );
    }
    
    getMessageRetentionDefaultValue = () => {
        if (!this.props.config.DataRetentionSettings.EnableMessageDeletion) {
            return {value: 'forever', label: <div><i className='icon icon-infinity option-icon'/><span>Keep Forever</span></div>};
        }
        
        if (this.props.config.DataRetentionSettings.MessageRetentionDays % 365 === 0) {
            return {value: 'years', label: 'Years'};
        }

        return {value: 'days', label: 'Days'};
    }

    getFileRetentionDefaultValue = () => {
        if (!this.props.config.DataRetentionSettings.EnableFileDeletion) {
            return {value: 'forever', label: <div><i className='icon icon-infinity option-icon'/><span>Keep Forever</span></div>};
        }
        
        if (this.props.config.DataRetentionSettings.FileRetentionDays % 365 === 0) {
            return {value: 'years', label: 'Years'};
        }

        return {value: 'days', label: 'Days'};
    }

    componentDidMount = async () => {
    }
    handleSubmit = (e) => {
        e.preventDefault();
        this.doSubmit();
        browserHistory.push('/admin_console/compliance/data_retention');
    };
    renderSettings = () => {

        return (
            <SettingsGroup>
                <Card
                    expanded={true}
                    className={'console'}
                >
                    <Card.Body>
                        <div
                            className='global_policy'
                        >
                            <p>Applies to all teams and channels, but does not apply to custom retention policies.</p>
                            <DropdownInputTransformer
                                onDropdownChange={(value) => {
                                    if (value.value === 'forever') {
                                        this.handleChange('enableMessageDeletion', 'false');
                                    } else {
                                        this.handleChange('enableMessageDeletion', 'true');
                                    }
                                    this.setState({ messageRetentionDropdownValue: value });
                                }}
                                onInputChange={(e) => {
                                    this.setState({ messageRetentionInputValue: e.target.value });
                                    let messageRetentionDays = this.state.messageRetentionDays;
                                    if (this.state.messageRetentionDropdownValue.value === 'years') {
                                        messageRetentionDays = parseInt(e.target.value) * 365;
                                    } else {
                                        messageRetentionDays = e.target.value;
                                    }
                                    this.handleChange('messageRetentionDays', messageRetentionDays);
                                }}
                                value={this.state.messageRetentionDropdownValue}
                                inputValue={this.state.messageRetentionInputValue}
                                width={500}
                                exceptionToInput={['forever']}
                                defaultValue={this.getMessageRetentionDefaultValue()}
                                options={[{value: 'days', label: 'Days'}, {value: 'years', label: 'Years'}, {value: 'forever', label: <div><i className='icon icon-infinity option-icon'/><span>Keep Forever</span></div>}]}
                                legend={Utils.localizeMessage('admin.data_retention.form.channelAndDirectMessageRetention', 'Channel & direct message retention')}
                                placeholder={Utils.localizeMessage('admin.data_retention.form.channelAndDirectMessageRetention', 'Channel & direct message retention')}
                                name={'channel_message_retention'}
                            />

                            <DropdownInputTransformer
                                onDropdownChange={(value) => {
                                    if (value.value === 'forever') {
                                        this.handleChange('enableFileDeletion', 'false');
                                    } else {
                                        this.handleChange('enableFileDeletion', 'true');
                                    }
                                    this.setState({ fileRetentionDropdownValue: value });
                                }}
                                onInputChange={(e) => {
                                    this.setState({ fileRetentionInputValue: e.target.value });
                                    let fileRetentionDays = this.state.fileRetentionDays;
                                    if (this.state.fileRetentionDropdownValue.value === 'years') {
                                        fileRetentionDays = parseInt(e.target.value) * 365;
                                    } else {
                                        fileRetentionDays = e.target.value;
                                    }
                                    this.handleChange('fileRetentionDays', fileRetentionDays);
                                }}
                                value={this.state.fileRetentionDropdownValue}
                                inputValue={this.state.fileRetentionInputValue}
                                width={500}
                                exceptionToInput={['forever']}
                                defaultValue={this.getFileRetentionDefaultValue()}
                                options={[{value: 'days', label: 'Days'}, {value: 'years', label: 'Years'}, {value: 'forever', label: <div><i className='icon icon-infinity option-icon'/><span>Keep Forever</span></div>}]}
                                legend={Utils.localizeMessage('admin.data_retention.form.fileRetention', 'File retention')}
                                placeholder={Utils.localizeMessage('admin.data_retention.form.fileRetention', 'File retention')}
                                name={'file_retention'}
                            />
                        </div>
                        
                    </Card.Body>
                </Card>
            </SettingsGroup>
        );
    }
}
