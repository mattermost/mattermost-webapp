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
                id='admin.messageExport.title'
                defaultMessage='Message Export (Beta)'
            />
        );
    }

    renderSettings() {
        const exportFormatOptions = [
            {value: 'actiance', text: Utils.localizeMessage('admin.messageExport.exportFormat.actiance', 'Actiance XML')}
        ];

        return (
            <SettingsGroup>
                <div className='banner'>
                    <div className='banner__content'>
                        <FormattedHTMLMessage
                            id='admin.messageExport.description'
                            defaultMessage='Message Export dumps all posts into a file that can be imported into third-party systems. The export task is scheduled to run once per day.'
                        />
                    </div>
                </div>

                <BooleanSetting
                    id='enableMessageExport'
                    label={
                        <FormattedMessage
                            id='admin.service.messageExportTitle'
                            defaultMessage='Enable Message Export:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.service.messageExportDesc'
                            defaultMessage='When true, the system will export all messages that are sent once per day.'
                        />
                    }
                    value={this.state.enableMessageExport}
                    onChange={this.handleChange}
                />

                <TextSetting
                    id='exportJobStartTime'
                    label={
                        <FormattedMessage
                            id='admin.messageExport.exportJobStartTime.title'
                            defaultMessage='Message Export Time:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.messageExport.exportJobStartTime.example', 'E.g.: "02:00"')}
                    helpText={
                        <FormattedMessage
                            id='admin.messageExport.exportJobStartTime.description'
                            defaultMessage='Set the start time of the daily scheduled message export job. Choose a time when fewer people are using your system. Must be a 24-hour time stamp in the form HH:MM.'
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
                            id='admin.messageExport.exportFormat.title'
                            defaultMessage='Export File Format:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.messageExport.exportFormat.description'
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
                            id='admin.messageExport.exportLocation.title'
                            defaultMessage='Export Directory:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.messageExport.exportLocation.example', 'E.g.: /var/mattermost/exports/')}
                    helpText={
                        <FormattedMessage
                            id='admin.messageExport.exportLocation.description'
                            defaultMessage='The directory on your hard drive to write export files to. Mattermost must have write access to this directory. Do not include a filename.'
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
                            id='admin.messageExport.createJob.title'
                            defaultMessage='Run Message Export job now'
                        />
                    }
                    createJobHelpText={
                        <FormattedMessage
                            id='admin.messageExport.createJob.help'
                            defaultMessage='Initiates a Message Export job immediately.'
                        />
                    }
                />
            </SettingsGroup>
        );
    }
}
