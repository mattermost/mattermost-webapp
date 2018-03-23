import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import {JobTypes} from 'utils/constants.jsx';
import * as Utils from 'utils/utils.jsx';

import AdminSettings from './admin_settings.jsx';
import BooleanSetting from './boolean_setting.jsx';
import DropdownSetting from './dropdown_setting.jsx';
import JobsTable from './jobs';
import SettingsGroup from './settings_group.jsx';
import TextSetting from './text_setting.jsx';

export default class MessageExportSettings extends AdminSettings {
    constructor(props) {
        super(props);

        this.getConfigFromState = this.getConfigFromState.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
    }

    getConfigFromState(config) {
        config.MessageExportSettings.EnableExport = this.state.enableComplianceExport;
        config.MessageExportSettings.ExportFormat = this.state.exportFormat;
        config.MessageExportSettings.DailyRunTime = this.state.exportJobStartTime;
        config.MessageExportSettings.GlobalRelayEmailAddress = this.state.globalRelayEmailAddress;
        return config;
    }

    getStateFromConfig(config) {
        return {
            enableComplianceExport: config.MessageExportSettings.EnableExport,
            exportFormat: config.MessageExportSettings.ExportFormat,
            exportJobStartTime: config.MessageExportSettings.DailyRunTime,
            globalRelayEmailAddress: config.MessageExportSettings.GlobalRelayEmailAddress,
        };
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.complianceExport.title'
                defaultMessage='Compliance Export (Beta)'
            />
        );
    }

    renderSettings() {
        const exportFormatOptions = [
            {value: 'actiance', text: Utils.localizeMessage('admin.complianceExport.exportFormat.actiance', 'Actiance XML')},
            // {value: 'globalrelay', text: Utils.localizeMessage('admin.complianceExport.exportFormat.globalrelay', 'GlobalRelay EML')},
        ];

        // if export format is globalrelay, user must set email address
        var dropdownHelpText;
        var globalRelayEmail;
        if (this.state.exportFormat === 'globalrelay') {
            globalRelayEmail = (
                <TextSetting
                    id='globalRelayEmailAddress'
                    label={
                        <FormattedMessage
                            id='admin.complianceExport.globalRelayEmailAddress.title'
                            defaultMessage='GlobalRelay Email Address:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.complianceExport.globalRelayEmailAddress.example', 'E.g.: "globalrelay@mattermost.com"')}
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.complianceExport.globalRelayEmailAddress.description'
                            defaultMessage='The email address that your GlobalRelay server monitors for incoming Compliance Exports.'
                        />
                    }
                    value={this.state.globalRelayEmailAddress === null ? '' : this.state.globalRelayEmailAddress}
                    disabled={!this.state.enableComplianceExport}
                    onChange={this.handleChange}
                />
            );

            dropdownHelpText = (
                <FormattedMessage
                    id='admin.complianceExport.exportFormat.globalrelay.description'
                    defaultMessage='Format of the compliance export. Corresponds to the system that you want to import the data into. Compliance Exports will be emailed to the configured email address.'
                />
            );
        } else {
            dropdownHelpText = (
                <FormattedHTMLMessage
                    id='admin.complianceExport.exportFormat.actiance.description'
                    defaultMessage='Format of the compliance export. Corresponds to the system that you want to import the data into. Compliance Export files will be written to the "exports" subdirectory of the configured <a href="/admin_console/files/storage">Local Storage Directory</a>.'
                />
            );
        }

        return (
            <SettingsGroup>
                {/*
                <div className='banner'>
                    <div className='banner__content'>
                        <FormattedHTMLMessage
                            id='admin.complianceExport.description'
                            defaultMessage='This feature supports compliance exports to the Actiance XML and GlobalRelay EML formats, and is currently in beta. Support for the Mattermost CSV format is scheduled for a future release, and will replace the existing <a href=\"/admin_console/general/compliance\">Compliance</a> feature.'
                        />
                    </div>
                </div>
                */}

                <div className='banner'>
                    <div className='banner__content'>
                        <FormattedHTMLMessage
                            id='admin.complianceExport.description_without_globalrelay'
                            defaultMessage='This feature supports compliance exports to the Actiance XML format, and is currently in beta. Support for GlobalRelay EML and the Mattermost CSV format is scheduled for a future release, and will replace the existing <a href=\"/admin_console/general/compliance\">Compliance</a> feature.'
                        />
                    </div>
                </div>

                <BooleanSetting
                    id='enableComplianceExport'
                    label={
                        <FormattedMessage
                            id='admin.service.complianceExportTitle'
                            defaultMessage='Enable Compliance Export:'
                        />
                    }
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.service.complianceExportDesc'
                            defaultMessage='When true, Mattermost will export all messages that were posted in the last 24 hours. The export task is scheduled to run once per day. See <a href=\"https://about.mattermost.com/default-compliance-export-documentation\" target=\"_blank\">the documentation</a> to learn more.'
                        />
                    }
                    value={this.state.enableComplianceExport}
                    onChange={this.handleChange}
                />

                <TextSetting
                    id='exportJobStartTime'
                    label={
                        <FormattedMessage
                            id='admin.complianceExport.exportJobStartTime.title'
                            defaultMessage='Compliance Export Time:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.complianceExport.exportJobStartTime.example', 'E.g.: "02:00"')}
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.complianceExport.exportJobStartTime.description'
                            defaultMessage='Set the start time of the daily scheduled compliance export job. Choose a time when fewer people are using your system. Must be a 24-hour time stamp in the form HH:MM.'
                        />
                    }
                    value={this.state.exportJobStartTime}
                    disabled={!this.state.enableComplianceExport}
                    onChange={this.handleChange}
                />

                <DropdownSetting
                    id='exportFormat'
                    values={exportFormatOptions}
                    label={
                        <FormattedMessage
                            id='admin.complianceExport.exportFormat.title'
                            defaultMessage='Export Format:'
                        />
                    }
                    helpText={dropdownHelpText}
                    value={this.state.exportFormat}
                    disabled={!this.state.enableComplianceExport}
                    onChange={this.handleChange}
                />

                {globalRelayEmail}

                <JobsTable
                    jobType={JobTypes.MESSAGE_EXPORT}
                    disabled={!this.state.enableComplianceExport}
                    createJobButtonText={
                        <FormattedMessage
                            id='admin.complianceExport.createJob.title'
                            defaultMessage='Run Compliance Export Job Now'
                        />
                    }
                    createJobHelpText={
                        <FormattedMessage
                            id='admin.complianceExport.createJob.help'
                            defaultMessage='Initiates a Compliance Export job immediately.'
                        />
                    }
                />
            </SettingsGroup>
        );
    }
}
