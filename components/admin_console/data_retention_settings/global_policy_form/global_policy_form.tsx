// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {AdminConfig} from 'mattermost-redux/types/config';

import * as Utils from 'utils/utils.jsx';
import AdminSettings, {BaseProps, BaseState} from 'components/admin_console/admin_settings';
import SettingsGroup from 'components/admin_console/settings_group.jsx';
import Card from 'components/card/card';
import BlockableLink from 'components/admin_console/blockable_link';
import {browserHistory} from 'utils/browser_history';
import DropdownInputHybrid from 'components/widgets/inputs/dropdown_input_hybrid';
import {keepForeverOption, yearsOption, daysOption, FOREVER, YEARS} from 'components/admin_console/data_retention_settings/dropdown_options/dropdown_options';

import './global_policy_form.scss';

type ValueType = {
    label: string | JSX.Element;
    value: string;
}
type Props = BaseProps & {
    config: AdminConfig;
    headerClassName: string;
};
type State = BaseState & {
    messageRetentionDropdownValue: ValueType;
    messageRetentionInputValue: string;
    fileRetentionDropdownValue: ValueType;
    fileRetentionInputValue: string;
    saveNeeded: boolean;
    saving: boolean;
    serverError: JSX.Element | string | null;
    errorTooltip: boolean;
    enableMessageDeletion: string;
    enableFileDeletion: string;
    messageRetentionDays: string;
    fileRetentionDays: string;
}

export default class GlobalPolicyForm extends AdminSettings<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = Object.assign(this.state, {
            saveNeeded: false,
            saving: false,
            serverError: null,
            errorTooltip: false,
        });
    }

    getStateFromConfig(config: Props['config']) {
        const {
            MessageRetentionDays,
            EnableMessageDeletion,
            FileRetentionDays,
            EnableFileDeletion,
        } = config.DataRetentionSettings;

        let messageDropdownValue: ValueType = daysOption();
        if (MessageRetentionDays % 365 === 0) {
            messageDropdownValue = yearsOption();
        }
        if (!EnableMessageDeletion) {
            messageDropdownValue = keepForeverOption();
        }

        let messageInputValue: string | number = '';
        if (EnableMessageDeletion && MessageRetentionDays) {
            messageInputValue = MessageRetentionDays;
        }
        if (EnableMessageDeletion && MessageRetentionDays % 365 === 0) {
            messageInputValue = MessageRetentionDays / 365;
        }

        let fileDropdownValue: ValueType = daysOption();
        if (FileRetentionDays % 365 === 0) {
            fileDropdownValue = yearsOption();
        }
        if (!EnableFileDeletion) {
            fileDropdownValue = keepForeverOption();
        }

        let fileInputValue: string | number = '';
        if (EnableFileDeletion && FileRetentionDays) {
            fileInputValue = FileRetentionDays;
        }
        if (EnableFileDeletion && FileRetentionDays % 365 === 0) {
            fileInputValue = FileRetentionDays / 365;
        }
        return {
            enableMessageDeletion: String(config.DataRetentionSettings?.EnableMessageDeletion),
            enableFileDeletion: String(config.DataRetentionSettings?.EnableFileDeletion),
            messageRetentionDays: String(config.DataRetentionSettings?.MessageRetentionDays),
            fileRetentionDays: String(config.DataRetentionSettings?.FileRetentionDays),
            messageRetentionDropdownValue: messageDropdownValue,
            messageRetentionInputValue: String(messageInputValue),
            fileRetentionDropdownValue: fileDropdownValue,
            fileRetentionInputValue: String(fileInputValue),
        };
    }

    getConfigFromState = (config: Props['config']) => {
        if (config && config.DataRetentionSettings) {
            config.DataRetentionSettings.EnableMessageDeletion = this.state.enableMessageDeletion === 'true';
            config.DataRetentionSettings.EnableFileDeletion = this.state.enableFileDeletion === 'true';
            config.DataRetentionSettings.MessageRetentionDays = parseInt(this.getRetentionInput(this.state.messageRetentionDropdownValue.value, this.state.messageRetentionInputValue), 10);
            config.DataRetentionSettings.FileRetentionDays = parseInt(this.getRetentionInput(this.state.fileRetentionDropdownValue.value, this.state.fileRetentionInputValue), 10);
        }
        return config;
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

    handleSaved = () => {
        browserHistory.push('/admin_console/compliance/data_retention');
    };

    getRetentionInput = (dropdownValue: string, value: string): string => {
        if (dropdownValue === YEARS && parseInt(value, 10) > 0) {
            return (parseInt(value, 10) * 365).toString();
        }
        return value;
    }

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
                            <p>{Utils.localizeMessage('admin.data_retention.form.text', 'Applies to all teams and channels, but does not apply to custom retention policies.')}</p>
                            <DropdownInputHybrid
                                onDropdownChange={(value) => {
                                    if (value.value === FOREVER) {
                                        this.handleChange('enableMessageDeletion', 'false');
                                    } else {
                                        this.handleChange('enableMessageDeletion', 'true');
                                    }
                                    this.setState({messageRetentionDropdownValue: value});
                                }}
                                onInputChange={(e) => {
                                    this.setState({messageRetentionInputValue: e.target.value});
                                    this.handleChange('messageRetentionDays', this.getRetentionInput(this.state.messageRetentionDropdownValue.value, e.target.value));
                                }}
                                value={this.state.messageRetentionDropdownValue}
                                inputValue={this.state.messageRetentionInputValue}
                                width={90}
                                exceptionToInput={[FOREVER]}
                                defaultValue={keepForeverOption()}
                                options={[daysOption(), yearsOption(), keepForeverOption()]}
                                legend={Utils.localizeMessage('admin.data_retention.form.channelAndDirectMessageRetention', 'Channel & direct message retention')}
                                placeholder={Utils.localizeMessage('admin.data_retention.form.channelAndDirectMessageRetention', 'Channel & direct message retention')}
                                name={'channel_message_retention'}
                                type={'number'}
                            />

                            <DropdownInputHybrid
                                onDropdownChange={(value) => {
                                    if (value.value === FOREVER) {
                                        this.handleChange('enableFileDeletion', 'false');
                                    } else {
                                        this.handleChange('enableFileDeletion', 'true');
                                    }
                                    this.setState({fileRetentionDropdownValue: value});
                                }}
                                onInputChange={(e) => {
                                    this.setState({fileRetentionInputValue: e.target.value});
                                    this.handleChange('fileRetentionDays', this.getRetentionInput(this.state.fileRetentionDropdownValue.value, e.target.value));
                                }}
                                value={this.state.fileRetentionDropdownValue}
                                inputValue={this.state.fileRetentionInputValue}
                                width={90}
                                exceptionToInput={[FOREVER]}
                                defaultValue={keepForeverOption()}
                                options={[daysOption(), yearsOption(), keepForeverOption()]}
                                legend={Utils.localizeMessage('admin.data_retention.form.fileRetention', 'File retention')}
                                placeholder={Utils.localizeMessage('admin.data_retention.form.fileRetention', 'File retention')}
                                name={'file_retention'}
                                type={'number'}
                            />
                        </div>

                    </Card.Body>
                </Card>
            </SettingsGroup>
        );
    }
}
