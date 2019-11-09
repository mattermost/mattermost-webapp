// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message';
import {recycleDatabaseConnection} from 'actions/admin_actions.jsx';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';

import AdminSettings from './admin_settings';
import BooleanSetting from './boolean_setting';
import RequestButton from './request_button/request_button.jsx';
import SettingsGroup from './settings_group.jsx';
import TextSetting from './text_setting.jsx';

export default class DatabaseSettings extends AdminSettings {
    getConfigFromState = (config) => {
        // driverName and dataSource are read-only from the UI

        config.SqlSettings.MaxIdleConns = this.parseIntNonZero(this.state.maxIdleConns);
        config.SqlSettings.MaxOpenConns = this.parseIntNonZero(this.state.maxOpenConns);
        config.SqlSettings.Trace = this.state.trace;
        config.SqlSettings.QueryTimeout = this.parseIntNonZero(this.state.queryTimeout);
        config.SqlSettings.ConnMaxLifetimeMilliseconds = this.parseIntNonNegative(this.state.connMaxLifetimeMilliseconds);
        config.ServiceSettings.MinimumHashtagLength = this.parseIntNonZero(this.state.minimumHashtagLength, 3, 2);

        return config;
    }

    getStateFromConfig(config) {
        return {
            driverName: config.SqlSettings.DriverName,
            dataSource: config.SqlSettings.DataSource,
            maxIdleConns: config.SqlSettings.MaxIdleConns,
            maxOpenConns: config.SqlSettings.MaxOpenConns,
            trace: config.SqlSettings.Trace,
            queryTimeout: config.SqlSettings.QueryTimeout,
            connMaxLifetimeMilliseconds: config.SqlSettings.ConnMaxLifetimeMilliseconds,
            minimumHashtagLength: config.ServiceSettings.MinimumHashtagLength,
        };
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.database.title'
                defaultMessage='Database Settings'
            />
        );
    }

    renderSettings = () => {
        const dataSource = '**********' + this.state.dataSource.substring(this.state.dataSource.indexOf('@'));

        let recycleDbButton = <div/>;
        if (this.props.license.IsLicensed === 'true') {
            recycleDbButton = (
                <RequestButton
                    requestAction={recycleDatabaseConnection}
                    helpText={
                        <FormattedMessage
                            id='admin.recycle.recycleDescription'
                            defaultMessage='Deployments using multiple databases can switch from one master database to another without restarting the Mattermost server by updating "config.json" to the new desired configuration and using the {reloadConfiguration} feature to load the new settings while the server is running. The administrator should then use {featureName} feature to recycle the database connections based on the new settings.'
                            values={{
                                featureName: (
                                    <b>
                                        <FormattedMessage
                                            id='admin.recycle.recycleDescription.featureName'
                                            defaultMessage='Recycle Database Connections'
                                        />
                                    </b>
                                ),
                                reloadConfiguration: (
                                    <a href='../environment/web_server'>
                                        <b>
                                            <FormattedMessage
                                                id='admin.recycle.recycleDescription.reloadConfiguration'
                                                defaultMessage='Environment > Web Server > Reload Configuration from Disk'
                                            />
                                        </b>
                                    </a>
                                ),
                            }}
                        />
                    }
                    buttonText={
                        <FormattedMessage
                            id='admin.recycle.button'
                            defaultMessage='Recycle Database Connections'
                        />
                    }
                    showSuccessMessage={false}
                    errorMessage={{
                        id: t('admin.recycle.reloadFail'),
                        defaultMessage: 'Recycling unsuccessful: {error}',
                    }}
                    includeDetailedError={true}
                />
            );
        }

        return (
            <SettingsGroup>
                <div className='banner'>
                    <FormattedMessage
                        id='admin.sql.noteDescription'
                        defaultMessage='Changing properties in this section will require a server restart before taking effect.'
                    />
                </div>
                <div className='form-group'>
                    <label
                        className='control-label col-sm-4'
                        htmlFor='DriverName'
                    >
                        <FormattedMessage
                            id='admin.sql.driverName'
                            defaultMessage='Driver Name:'
                        />
                    </label>
                    <div className='col-sm-8'>
                        <input
                            type='text'
                            className='form-control'
                            value={this.state.driverName}
                            disabled={true}
                        />
                        <div className='help-text'>
                            <FormattedMessage
                                id='admin.sql.driverNameDescription'
                                defaultMessage='Set the database driver in the config.json file.'
                            />
                        </div>
                    </div>
                </div>
                <div className='form-group'>
                    <label
                        className='control-label col-sm-4'
                        htmlFor='DataSource'
                    >
                        <FormattedMessage
                            id='admin.sql.dataSource'
                            defaultMessage='Data Source:'
                        />
                    </label>
                    <div className='col-sm-8'>
                        <input
                            type='text'
                            className='form-control'
                            value={dataSource}
                            disabled={true}
                        />
                        <div className='help-text'>
                            <FormattedMessage
                                id='admin.sql.dataSourceDescription'
                                defaultMessage='Set the database source in the config.json file.'
                            />
                        </div>
                    </div>
                </div>
                <TextSetting
                    id='maxIdleConns'
                    label={
                        <FormattedMessage
                            id='admin.sql.maxConnectionsTitle'
                            defaultMessage='Maximum Idle Connections:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.sql.maxConnectionsExample', 'E.g.: "10"')}
                    helpText={
                        <FormattedMessage
                            id='admin.sql.maxConnectionsDescription'
                            defaultMessage='Maximum number of idle connections held open to the database.'
                        />
                    }
                    value={this.state.maxIdleConns}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('SqlSettings.MaxIdleConns')}
                />
                <TextSetting
                    id='maxOpenConns'
                    label={
                        <FormattedMessage
                            id='admin.sql.maxOpenTitle'
                            defaultMessage='Maximum Open Connections:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.sql.maxOpenExample', 'E.g.: "10"')}
                    helpText={
                        <FormattedMessage
                            id='admin.sql.maxOpenDescription'
                            defaultMessage='Maximum number of open connections held open to the database.'
                        />
                    }
                    value={this.state.maxOpenConns}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('SqlSettings.MaxOpenConns')}
                />
                <TextSetting
                    id='queryTimeout'
                    label={
                        <FormattedMessage
                            id='admin.sql.queryTimeoutTitle'
                            defaultMessage='Query Timeout:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.sql.queryTimeoutExample', 'E.g.: "30"')}
                    helpText={
                        <FormattedMessage
                            id='admin.sql.queryTimeoutDescription'
                            defaultMessage='The number of seconds to wait for a response from the database after opening a connection and sending the query. Errors that you see in the UI or in the logs as a result of a query timeout can vary depending on the type of query.'
                        />
                    }
                    value={this.state.queryTimeout}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('SqlSettings.QueryTimeout')}
                />
                <TextSetting
                    id='connMaxLifetimeMilliseconds'
                    label={
                        <FormattedMessage
                            id='admin.sql.connMaxLifetimeTitle'
                            defaultMessage='Maximum Connection Lifetime:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.sql.connMaxLifetimeExample', 'E.g.: "3600000"')}
                    helpText={
                        <FormattedMessage
                            id='admin.sql.connMaxLifetimeDescription'
                            defaultMessage='Maximum lifetime for a connection to the database in milliseconds.'
                        />
                    }
                    value={this.state.connMaxLifetimeMilliseconds}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('SqlSettings.ConnMaxLifetimeMilliseconds')}
                />
                <TextSetting
                    id='minimumHashtagLength'
                    label={
                        <FormattedMessage
                            id='admin.service.minimumHashtagLengthTitle'
                            defaultMessage='Minimum Hashtag Length:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.service.minimumHashtagLengthExample', 'E.g.: "3"')}
                    helpText={
                        <FormattedMarkdownMessage
                            id='admin.service.minimumHashtagLengthDescription'
                            defaultMessage='Minimum number of characters in a hashtag. This must be greater than or equal to 2. MySQL databases must be configured to support searching strings shorter than three characters, [see documentation](!https://dev.mysql.com/doc/refman/8.0/en/fulltext-fine-tuning.html).'
                        />
                    }
                    value={this.state.minimumHashtagLength}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('ServiceSettings.MinimumHashtagLength')}
                />
                <BooleanSetting
                    id='trace'
                    label={
                        <FormattedMessage
                            id='admin.sql.traceTitle'
                            defaultMessage='SQL Statement Logging: '
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.sql.traceDescription'
                            defaultMessage='(Development Mode) When true, executing SQL statements are written to the log.'
                        />
                    }
                    value={this.state.trace}
                    onChange={this.handleChange}
                    setByEnv={this.isSetByEnv('SqlSettings.Trace')}
                />
                {recycleDbButton}
            </SettingsGroup>
        );
    }
}
