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
        config.MessageExportSettings.EnableExport = this.state.enableMessageExport;
        config.MessageExportSettings.DailyRunTime = this.state.exportJobStartTime;
        config.MessageExportSettings.FileLocation = this.state.exportLocation;
        return config;
    }

    getStateFromConfig(config) {
        return {
            enableMessageExport: config.MessageExportSettings.EnableExport,
            exportJobStartTime: config.MessageExportSettings.DailyRunTime,
            exportLocation: config.MessageExportSettings.FileLocation
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
            {value: 'actiance', text: Utils.localizeMessage('admin.complianceExport.exportFormat.actiance', 'Actiance XML')}
        ];

        return (
            <SettingsGroup>
                <div className='banner'>
                    <div className='banner__content'>
                        <FormattedHTMLMessage
                            id='admin.complianceExport.description'
                            defaultMessage='This feature supports compliance exports to the Actiance XML format, and is currently in beta. Support for the GlobalRelay EML format and the Mattermost CSV format are scheduled for a future release, and will replace the existing <a href=\"/admin_console/general/compliance\" target=\"_blank\">Compliance</a> feature.'
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
                            defaultMessage='When true, Mattermost will generate a compliance export file that contains all messages that were posted in the past 24h. The export task is scheduled to run once per day. See <a href=\"https://about.mattermost.com/default-compliance-export-documentation\" target=\"_blank\">the documentation</a> to learn more.'
                        />
                    }
                    value={this.state.enableMessageExport}
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
                            defaultMessage='Set the start time of the daily scheduled compliance export job. Choose a time when fewer people are using your system.<br />Must be a 24-hour time stamp in the form HH:MM. For example, 1:15am would be expressed as 01:15, while 1:15pm would be expressed as 13:15.'
                        />
                    }
                    value={this.state.exportJobStartTime}
                    disabled={!this.state.enableMessageExport}
                    onChange={this.handleChange}
                />

                {/* dropdown value is hard-coded until we support more than one export format */}
                <DropdownSetting
                    id='exportFormat'
                    values={exportFormatOptions}
                    label={
                        <FormattedMessage
                            id='admin.complianceExport.exportFormat.title'
                            defaultMessage='Export File Format:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.complianceExport.exportFormat.description'
                            defaultMessage='The file format to write exported data in. Corresponds to the system that you want to import the data into.'
                        />
                    }
                    value='actiance'
                    disabled={!this.state.enableMessageExport}
                    onChange={this.handleChange}
                />

                <TextSetting
                    id='exportLocation'
                    label={
                        <FormattedMessage
                            id='admin.complianceExport.exportLocation.title'
                            defaultMessage='Export Directory:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.complianceExport.exportLocation.example', 'E.g.: /var/mattermost/exports/')}
                    helpText={
                        <FormattedHTMLMessage
                            id='admin.complianceExport.exportLocation.description'
                            defaultMessage='The directory to write compliance export files to. Must be a subdirectory of the <a href=\"/admin_console/files/storage\" target=\"_blank\">Local Storage Directory</a>. Mattermost must have write access to this directory, and the path that you set must not include a filename.'
                        />
                    }
                    value={this.state.exportLocation}
                    disabled={!this.state.enableMessageExport}
                    onChange={this.handleChange}
                />

                <JobsTable
                    jobType={JobTypes.MESSAGE_EXPORT}
                    disabled={!this.state.enableMessageExport}
                    createJobButtonText={
                        <FormattedMessage
                            id='admin.complianceExport.createJob.title'
                            defaultMessage='Run Compliance Export job now'
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
