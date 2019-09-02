// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';
import PropTypes from 'prop-types';

import {saveConfig} from 'actions/admin_actions.jsx';
import AdminSettings from 'components/admin_console/admin_settings.jsx';

import SettingsGroup from 'components/admin_console/settings_group.jsx';
import BooleanSetting from 'components/admin_console/boolean_setting.jsx';
import TextSetting from 'components/admin_console/text_setting.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import LoadingScreen from 'components/loading_screen.jsx';

import {Constants} from 'utils/constants';

export default class CustomTermsOfServiceSettings extends AdminSettings {
    static propTypes = {
        actions: PropTypes.shape({
            getTermsOfService: PropTypes.func.isRequired,
            createTermsOfService: PropTypes.func.isRequired,
        }).isRequired,
        config: PropTypes.object,
        license: PropTypes.object,
        setNavigationBlocked: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            termsEnabled: props.config.SupportSettings.CustomTermsOfServiceEnabled,
            reAcceptancePeriod: props.config.SupportSettings.CustomTermsOfServiceReAcceptancePeriod,
            loadingTermsText: true,
            receivedTermsText: '',
            termsText: '',
            saveNeeded: false,
            saving: false,
            serverError: null,
            errorTooltip: false,
        };
    }

    getStateFromConfig(config) {
        return {
            termsEnabled: config.SupportSettings.CustomTermsOfServiceEnabled,
            reAcceptancePeriod: config.SupportSettings.CustomTermsOfServiceReAcceptancePeriod,
        };
    }

    getConfigFromState = (config) => {
        config.SupportSettings.CustomTermsOfServiceEnabled = this.state.termsEnabled;
        config.SupportSettings.CustomTermsOfServiceReAcceptancePeriod = this.parseIntNonZero(this.state.reAcceptancePeriod, Constants.DEFAULT_TERMS_OF_SERVICE_RE_ACCEPTANCE_PERIOD);

        return config;
    }

    componentDidMount() {
        this.getTermsOfService();
    }

    doSubmit = async (callback) => {
        this.setState({
            saving: true,
            serverError: null,
        });

        if (this.state.termsEnabled && (this.state.receivedTermsText !== this.state.termsText || !this.props.config.SupportSettings.CustomTermsOfServiceEnabled)) {
            const result = await this.props.actions.createTermsOfService(this.state.termsText);
            if (result.error) {
                this.handleAPIError(result.error, callback);
                return;
            }
        }

        // clone config so that we aren't modifying data in the stores
        let config = JSON.parse(JSON.stringify(this.props.config));
        config = this.getConfigFromState(config);

        saveConfig(
            config,
            (savedConfig) => {
                this.setState(this.getStateFromConfig(savedConfig));

                this.setState({
                    saveNeeded: false,
                    saving: false,
                });

                this.props.setNavigationBlocked(false);

                if (callback) {
                    callback();
                }

                if (this.handleSaved) {
                    this.handleSaved(config);
                }
            },
            (err) => {
                this.handleAPIError(err, callback, config);
            }
        );
    };

    handleAPIError = (err, callback, config) => {
        this.setState({
            saving: false,
            serverError: err.message,
            serverErrorId: err.id,
        });

        if (callback) {
            callback();
        }

        if (this.handleSaved && config) {
            this.handleSaved(config);
        }
    };

    getTermsOfService = async () => {
        this.setState({loadingTermsText: true});

        const res = await this.props.actions.getTermsOfService();
        if (res.data) {
            this.setState({
                termsText: res.data.text,
                receivedTermsText: res.data.text,
            });
        }

        this.setState({loadingTermsText: false});
    };

    handleTermsTextChange = (id, value) => {
        this.handleChange('termsText', value);
    };

    handleTermsEnabledChange = (id, value) => {
        this.handleChange('termsEnabled', value);
    };

    handleReAcceptancePeriodChange = (id, value) => {
        this.handleChange('reAcceptancePeriod', value);
    };

    renderTitle() {
        return (
            <FormattedMessage
                id='admin.support.termsOfServiceTitle'
                defaultMessage='Custom Terms of Service (Beta)'
            />
        );
    }

    renderSettings = () => {
        if (this.state.loadingTermsText) {
            return <LoadingScreen/>;
        }

        return (
            <SettingsGroup>
                <BooleanSetting
                    key={'customTermsOfServiceEnabled'}
                    id={'SupportSettings.CustomTermsOfServiceEnabled'}
                    label={
                        <FormattedMessage
                            id='admin.support.enableTermsOfServiceTitle'
                            defaultMessage='Enable Custom Terms of Service'
                        />
                    }
                    helpText={
                        <FormattedMarkdownMessage
                            id='admin.support.enableTermsOfServiceHelp'
                            defaultMessage='When true, new users must accept the terms of service before accessing any Mattermost teams on desktop, web or mobile. Existing users must accept them after login or a page refresh.\n \nTo update terms of service link displayed in account creation and login pages, go to [Site Configuration > Customization](../site_config/customization).'
                        />
                    }
                    value={this.state.termsEnabled}
                    disabled={!(this.props.license.IsLicensed && this.props.license.CustomTermsOfService === 'true')}
                    onChange={this.handleTermsEnabledChange}
                    setByEnv={this.isSetByEnv('SupportSettings.CustomTermsOfServiceEnabled')}
                />
                <TextSetting
                    key={'customTermsOfServiceText'}
                    id={'SupportSettings.CustomTermsOfServiceText'}
                    type={'textarea'}
                    label={
                        <FormattedMessage
                            id='admin.support.termsOfServiceTextTitle'
                            defaultMessage='Custom Terms of Service Text'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.support.termsOfServiceTextHelp'
                            defaultMessage='Text that will appear in your custom Terms of Service. Supports Markdown-formatted text.'
                        />
                    }
                    disabled={!this.state.termsEnabled}
                    onChange={this.handleTermsTextChange}
                    setByEnv={this.isSetByEnv('SupportSettings.CustomTermsOfServiceText')}
                    value={this.state.termsText}
                    maxLength={Constants.MAX_TERMS_OF_SERVICE_TEXT_LENGTH}
                />
                <TextSetting
                    key={'customTermsOfServiceReAcceptancePeriod'}
                    id={'SupportSettings.CustomTermsOfServiceReAcceptancePeriod'}
                    type={'number'}
                    label={
                        <FormattedMessage
                            id='admin.support.termsOfServiceReAcceptanceTitle'
                            defaultMessage='Re-Acceptance Period:'
                        />
                    }
                    helpText={
                        <FormattedMessage
                            id='admin.support.termsOfServiceReAcceptanceHelp'
                            defaultMessage='The number of days before Terms of Service acceptance expires, and the terms must be re-accepted.'
                        />
                    }
                    disabled={!this.state.termsEnabled}
                    value={this.state.reAcceptancePeriod}
                    onChange={this.handleReAcceptancePeriodChange}
                    setByEnv={this.isSetByEnv('SupportSettings.CustomTermsOfServiceReAcceptancePeriod')}
                />
            </SettingsGroup>
        );
    }
}
