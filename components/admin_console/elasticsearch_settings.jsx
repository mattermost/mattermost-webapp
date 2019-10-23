// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {elasticsearchPurgeIndexes, elasticsearchTest} from 'actions/admin_actions.jsx';
import {JobStatuses, JobTypes} from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n';

import AdminSettings from './admin_settings.jsx';
import BooleanSetting from './boolean_setting.jsx';
import JobsTable from './jobs';
import RequestButton from './request_button/request_button.jsx';
import SettingsGroup from './settings_group.jsx';
import TextSetting from './text_setting.jsx';

export default class ElasticsearchSettings extends AdminSettings {
    getConfigFromState = (config) => {
        config.ElasticsearchSettings.ConnectionUrl = this.state.connectionUrl;
        config.ElasticsearchSettings.SkipTLSVerification = this.state.skipTLSVerification;
        config.ElasticsearchSettings.Username = this.state.username;
        config.ElasticsearchSettings.Password = this.state.password;
        config.ElasticsearchSettings.Sniff = this.state.sniff;
        config.ElasticsearchSettings.EnableIndexing = this.state.enableIndexing;
        config.ElasticsearchSettings.EnableSearching = this.state.enableSearching;
        config.ElasticsearchSettings.EnableAutocomplete = this.state.enableAutocomplete;

        return config;
    }

    getStateFromConfig(config) {
        return {
            connectionUrl: config.ElasticsearchSettings.ConnectionUrl,
            skipTLSVerification: config.ElasticsearchSettings.SkipTLSVerification,
            username: config.ElasticsearchSettings.Username,
            password: config.ElasticsearchSettings.Password,
            sniff: config.ElasticsearchSettings.Sniff,
            enableIndexing: config.ElasticsearchSettings.EnableIndexing,
            enableSearching: config.ElasticsearchSettings.EnableSearching,
            enableAutocomplete: config.ElasticsearchSettings.EnableAutocomplete,
            configTested: true,
            canSave: true,
            canPurgeAndIndex: config.ElasticsearchSettings.EnableIndexing,
        };
    }

    handleSettingChanged = (id, value) => {
        if (id === 'enableIndexing') {
            if (value === false) {
                this.setState({
                    enableSearching: false,
                    enableAutocomplete: false,
                });
            } else {
                this.setState({
                    canSave: false,
                    configTested: false,
                });
            }
        }

        if (id === 'connectionUrl' || id === 'skipTLSVerification' || id === 'username' || id === 'password' || id === 'sniff') {
            this.setState({
                configTested: false,
                canSave: false,
            });
        }

        if (id !== 'enableSearching' && id !== 'enableAutocomplete') {
            this.setState({
                canPurgeAndIndex: false,
            });
        }

        this.handleChange(id, value);
    }

    handleSaved = () => {
        this.setState({
            canPurgeAndIndex: this.state.enableIndexing,
        });
    }

    canSave() {
        return this.state.canSave;
    }

    doTestConfig = (success, error) => {
        const config = JSON.parse(JSON.stringify(this.props.config));
        this.getConfigFromState(config);

        elasticsearchTest(
            config,
            () => {
                this.setState({
                    configTested: true,
                    canSave: true,
                });
                success();
                this.doSubmit();
            },
            (err) => {
                this.setState({
                    configTested: false,
                    canSave: false,
                });
                error(err);
            }
        );
    }

    getExtraInfo(job) {
        if (job.status === JobStatuses.IN_PROGRESS) {
            return (
                <FormattedMessage
                    id='admin.elasticsearch.percentComplete'
                    defaultMessage='{percent}% Complete'
                    values={{percent: Number(job.progress)}}
                />
            );
        }

        return null;
    }

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.elasticsearch.title'
                defaultMessage='Elasticsearch'
            />
        );
    }

    renderSettings = () => {
        return (
            <SettingsGroup>
                <BooleanSetting
                    id='enableIndexing'
                    label={
                        <FormattedMessage
                            id='admin.elasticsearch.enableIndexingTitle'
                            defaultMessage='Enable Elasticsearch Indexing:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.elasticsearch.enableIndexingDescription'
                            defaultMessage='When true, indexing of new posts occurs automatically. Search queries will use database search until "Enable Elasticsearch for search queries" is enabled. {documentationLink}'
                            values={{
                                documentationLink: (
                                    <a
                                        href='https://about.mattermost.com/default-elasticsearch-documentation/'
                                        rel='noopener noreferrer'
                                        target='_blank'
                                    >
                                        <FormattedMessage
                                            id='admin.elasticsearch.enableIndexingDescription.documentationLinkText'
                                            defaultMessage='Learn more about Elasticsearch in our documentation.'
                                        />
                                    </a>
                                ),
                            }}
                        />
                    }
                    value={this.state.enableIndexing}
                    onChange={this.handleSettingChanged}
                    setByEnv={this.isSetByEnv('ElasticsearchSettings.EnableIndexing')}
                />
                <TextSetting
                    id='connectionUrl'
                    label={
                        <FormattedMessage
                            id='admin.elasticsearch.connectionUrlTitle'
                            defaultMessage='Server Connection Address:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.elasticsearch.connectionUrlExample', 'E.g.: "https://elasticsearch.example.org:9200"')}
                    helpText={
                        <FormattedMessage
                            id='admin.elasticsearch.connectionUrlDescription'
                            defaultMessage='The address of the Elasticsearch server. {documentationLink}'
                            values={{
                                documentationLink: (
                                    <a
                                        href='https://about.mattermost.com/default-elasticsearch-server-setup/'
                                        rel='noopener noreferrer'
                                        target='_blank'
                                    >
                                        <FormattedMessage
                                            id='admin.elasticsearch.connectionUrlExample.documentationLinkText'
                                            defaultMessage='Please see documentation with server setup instructions.'
                                        />
                                    </a>
                                ),
                            }}
                        />
                    }
                    value={this.state.connectionUrl}
                    disabled={!this.state.enableIndexing}
                    onChange={this.handleSettingChanged}
                    setByEnv={this.isSetByEnv('ElasticsearchSettings.ConnectionUrl')}
                />
                <BooleanSetting
                    id='skipTLSVerification'
                    label={
                        <FormattedMessage
                            id='admin.elasticsearch.skipTLSVerificationTitle'
                            defaultMessage='Skip TLS Verification:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.elasticsearch.skipTLSVerificationDescription'
                            defaultMessage='When true, Mattermost will not require the Elasticsearch certificate to be signed by a trusted Certificate Authority.'
                        />
                    }
                    value={this.state.skipTLSVerification}
                    disabled={!this.state.enableIndexing}
                    onChange={this.handleSettingChanged}
                    setByEnv={this.isSetByEnv('ElasticsearchSettings.SkipTLSVerification')}
                />
                <TextSetting
                    id='username'
                    label={
                        <FormattedMessage
                            id='admin.elasticsearch.usernameTitle'
                            defaultMessage='Server Username:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.elasticsearch.usernameExample', 'E.g.: "elastic"')}
                    helpText={
                        <FormattedMessage
                            id='admin.elasticsearch.usernameDescription'
                            defaultMessage='(Optional) The username to authenticate to the Elasticsearch server.'
                        />
                    }
                    value={this.state.username}
                    disabled={!this.state.enableIndexing}
                    onChange={this.handleSettingChanged}
                    setByEnv={this.isSetByEnv('ElasticsearchSettings.Username')}
                />
                <TextSetting
                    id='password'
                    label={
                        <FormattedMessage
                            id='admin.elasticsearch.passwordTitle'
                            defaultMessage='Server Password:'
                        />
                    }
                    placeholder={Utils.localizeMessage('admin.elasticsearch.password', 'E.g.: "yourpassword"')}
                    helpText={
                        <FormattedMessage
                            id='admin.elasticsearch.passwordDescription'
                            defaultMessage='(Optional) The password to authenticate to the Elasticsearch server.'
                        />
                    }
                    value={this.state.password}
                    disabled={!this.state.enableIndexing}
                    onChange={this.handleSettingChanged}
                    setByEnv={this.isSetByEnv('ElasticsearchSettings.Password')}
                />
                <BooleanSetting
                    id='sniff'
                    label={
                        <FormattedMessage
                            id='admin.elasticsearch.sniffTitle'
                            defaultMessage='Enable Cluster Sniffing:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.elasticsearch.sniffDescription'
                            defaultMessage='When true, sniffing finds and connects to all data nodes in your cluster automatically.'
                        />
                    }
                    value={this.state.sniff}
                    disabled={!this.state.enableIndexing}
                    onChange={this.handleSettingChanged}
                    setByEnv={this.isSetByEnv('ElasticsearchSettings.Sniff')}
                />
                <RequestButton
                    id='testConfig'
                    requestAction={this.doTestConfig}
                    helpText={
                        <FormattedMessage
                            id='admin.elasticsearch.testHelpText'
                            defaultMessage='Tests if the Mattermost server can connect to the Elasticsearch server specified. Testing the connection only saves the configuration if the test is successful. See log file for more detailed error messages.'
                        />
                    }
                    buttonText={
                        <FormattedMessage
                            id='admin.elasticsearch.elasticsearch_test_button'
                            defaultMessage='Test Connection'
                        />
                    }
                    successMessage={{
                        id: t('admin.elasticsearch.testConfigSuccess'),
                        defaultMessage: 'Test successful. Configuration saved.',
                    }}
                    disabled={!this.state.enableIndexing}
                />
                <div className='form-group'>
                    <label
                        className='control-label col-sm-4'
                    >
                        <FormattedMessage
                            id='admin.elasticsearch.bulkIndexingTitle'
                            defaultMessage='Bulk Indexing:'
                        />
                    </label>
                    <div className='col-sm-8'>
                        <div className='job-table-setting'>
                            <JobsTable
                                jobType={JobTypes.ELASTICSEARCH_POST_INDEXING}
                                disabled={!this.state.canPurgeAndIndex}
                                createJobButtonText={
                                    <FormattedMessage
                                        id='admin.elasticsearch.createJob.title'
                                        defaultMessage='Index Now'
                                    />
                                }
                                createJobHelpText={
                                    <FormattedMessage
                                        id='admin.elasticsearch.createJob.help'
                                        defaultMessage='All users, channels and posts in the database will be indexed from oldest to newest. Elasticsearch is available during indexing but search results may be incomplete until the indexing job is complete.'
                                    />
                                }
                                getExtraInfoText={this.getExtraInfo}
                            />
                        </div>
                    </div>
                </div>
                <RequestButton
                    id='purgeIndexesSection'
                    requestAction={elasticsearchPurgeIndexes}
                    helpText={
                        <FormattedMessage
                            id='admin.elasticsearch.purgeIndexesHelpText'
                            defaultMessage='Purging will entirely remove the indexes on the Elasticsearch server. Search results may be incomplete until a bulk index of the existing database is rebuilt.'
                        />
                    }
                    buttonText={
                        <FormattedMessage
                            id='admin.elasticsearch.purgeIndexesButton'
                            defaultMessage='Purge Index'
                        />
                    }
                    successMessage={{
                        id: t('admin.elasticsearch.purgeIndexesButton.success'),
                        defaultMessage: 'Indexes purged successfully.',
                    }}
                    errorMessage={{
                        id: t('admin.elasticsearch.purgeIndexesButton.error'),
                        defaultMessage: 'Failed to purge indexes: {error}',
                    }}
                    disabled={!this.state.canPurgeAndIndex}
                    label={(
                        <FormattedMessage
                            id='admin.elasticsearch.purgeIndexesButton.label'
                            defaultMessage='Purge Indexes:'
                        />
                    )}
                />
                <BooleanSetting
                    id='enableSearching'
                    label={
                        <FormattedMessage
                            id='admin.elasticsearch.enableSearchingTitle'
                            defaultMessage='Enable Elasticsearch for search queries:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.elasticsearch.enableSearchingDescription'
                            defaultMessage='Requires a successful connection to the Elasticsearch server. When true, Elasticsearch will be used for all search queries using the latest index. Search results may be incomplete until a bulk index of the existing post database is finished. When false, database search is used.'
                        />
                    }
                    value={this.state.enableSearching}
                    disabled={!this.state.enableIndexing || !this.state.configTested}
                    onChange={this.handleSettingChanged}
                    setByEnv={this.isSetByEnv('ElasticsearchSettings.EnableSearching')}
                />
                <BooleanSetting
                    id='enableAutocomplete'
                    label={
                        <FormattedMessage
                            id='admin.elasticsearch.enableAutocompleteTitle'
                            defaultMessage='Enable Elasticsearch for autocomplete queries:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.elasticsearch.enableAutocompleteDescription'
                            defaultMessage='Requires a successful connection to the Elasticsearch server. When true, Elasticsearch will be used for all autocompletion queries on users and channels using the latest index. Autocompletion results may be incomplete until a bulk index of the existing users and channels database is finished. When false, database autocomplete is used.'
                        />
                    }
                    value={this.state.enableAutocomplete}
                    disabled={!this.state.enableIndexing || !this.state.configTested}
                    onChange={this.handleSettingChanged}
                    setByEnv={this.isSetByEnv('ElasticsearchSettings.EnableAutocomplete')}
                />
            </SettingsGroup>
        );
    }
}
