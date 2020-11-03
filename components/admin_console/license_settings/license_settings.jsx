// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedDate, FormattedTime, FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';
import {format} from 'utils/markdown';

import * as AdminActions from 'actions/admin_actions.jsx';
import {trackEvent} from 'actions/telemetry_actions';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';

export default class LicenseSettings extends React.PureComponent {
    static propTypes = {
        license: PropTypes.object.isRequired,
        enterpriseReady: PropTypes.bool.isRequired,
        upgradedFromTE: PropTypes.bool.isRequired,
        stats: PropTypes.object,
        config: PropTypes.object,
        isDisabled: PropTypes.bool,
        actions: PropTypes.shape({
            getLicenseConfig: PropTypes.func.isRequired,
            uploadLicense: PropTypes.func.isRequired,
            removeLicense: PropTypes.func.isRequired,
            upgradeToE0: PropTypes.func.isRequired,
            restartServer: PropTypes.func.isRequired,
            ping: PropTypes.func.isRequired,
            upgradeToE0Status: PropTypes.func.isRequired,
            requestTrialLicense: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.interval = null;
        this.state = {
            fileSelected: false,
            fileName: null,
            serverError: null,
            gettingTrialError: null,
            gettingTrial: false,
            removing: false,
            uploading: false,
            upgradingPercentage: 0,
            upgradeError: null,
            restarting: false,
            restartError: null,
        };
    }

    componentDidMount() {
        if (!this.props.enterpriseReady) {
            this.reloadPercentage();
        }
        this.props.actions.getLicenseConfig();
        AdminActions.getStandardAnalytics();
    }

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    reloadPercentage = async () => {
        const {percentage, error} = await this.props.actions.upgradeToE0Status();
        if (percentage === 100 || error) {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
                if (error) {
                    trackEvent('api', 'upgrade_to_e0_failed', {error});
                } else {
                    trackEvent('api', 'upgrade_to_e0_success');
                }
            }
        } else if (percentage > 0 && !this.interval) {
            this.interval = setInterval(this.reloadPercentage, 2000);
        }
        this.setState({upgradingPercentage: percentage || 0, upgradeError: error});
    }

    handleChange = () => {
        const element = this.refs.fileInput;
        if (element && element.files.length > 0) {
            this.setState({fileSelected: true, fileName: element.files[0].name});
        }
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        const element = this.refs.fileInput;
        if (!element || element.files.length === 0) {
            return;
        }
        const file = element.files[0];

        this.setState({uploading: true});

        const {error} = await this.props.actions.uploadLicense(file);
        if (error) {
            Utils.clearFileInput(element[0]);
            this.setState({fileSelected: false, fileName: null, serverError: error.message, uploading: false});
            return;
        }

        await this.props.actions.getLicenseConfig();
        this.setState({fileSelected: false, fileName: null, serverError: null, uploading: false});
    }

    handleRemove = async (e) => {
        e.preventDefault();

        this.setState({removing: true});

        const {error} = await this.props.actions.removeLicense();
        if (error) {
            this.setState({fileSelected: false, fileName: null, serverError: error.message, removing: false});
            return;
        }

        await this.props.actions.getLicenseConfig();
        this.setState({fileSelected: false, fileName: null, serverError: null, removing: false});
    }

    handleUpgrade = async (e) => {
        e.preventDefault();
        if (this.state.upgradingPercentage > 0) {
            return;
        }
        try {
            await this.props.actions.upgradeToE0();
            this.setState({upgradingPercetage: 1});
            await this.reloadPercentage();
        } catch (error) {
            trackEvent('api', 'upgrade_to_e0_failed', {error: error.message});
            this.setState({upgradeError: error.message, upgradingPercetage: 0});
        }
    }

    requestLicense = async (e) => {
        e.preventDefault();
        if (this.state.gettingTrial) {
            return;
        }
        this.setState({gettingTrial: true, gettingTrialError: null});
        const requestedUsers = Math.max(this.props.stats.TOTAL_USERS, 30);
        const {error} = await this.props.actions.requestTrialLicense(requestedUsers, true, true, 'license');
        if (error) {
            this.setState({gettingTrialError: error});
        }
        this.setState({gettingTrial: false});
        this.props.actions.getLicenseConfig();
    }

    checkRestarted = () => {
        this.props.actions.ping().then(() => {
            window.location.reload();
        }).catch(() => {
            setTimeout(this.checkRestarted, 1000);
        });
    }

    handleRestart = async (e) => {
        e.preventDefault();
        this.setState({restarting: true});
        try {
            await this.props.actions.restartServer();
        } catch (err) {
            this.setState({restarting: false, restartError: err});
        }
        setTimeout(this.checkRestarted, 1000);
    }

    render() {
        let gettingTrialError = '';
        if (this.state.gettingTrialError) {
            gettingTrialError = (
                <p className='trial-error'>
                    <FormattedMarkdownMessage
                        id='admin.license.trial-request.error'
                        defaultMessage='Trial license could not be retrieved. Visit [https://mattermost.com/trial/](https://mattermost.com/trial/) to request a license.'
                    />
                </p>
            );
        }

        const {license, upgradedFromTE, isDisabled} = this.props;
        const {uploading} = this.state;

        let edition;
        let licenseType;
        let licenseContent;
        let eelicense;

        const issued = (
            <React.Fragment>
                <FormattedDate value={new Date(parseInt(license.IssuedAt, 10))}/>
                {' '}
                <FormattedTime value={new Date(parseInt(license.IssuedAt, 10))}/>
            </React.Fragment>
        );
        const startsAt = <FormattedDate value={new Date(parseInt(license.StartsAt, 10))}/>;
        const expiresAt = <FormattedDate value={new Date(parseInt(license.ExpiresAt, 10))}/>;

        if (!this.props.enterpriseReady) { // Team Edition
            // Note: DO NOT LOCALISE THESE STRINGS. Legally we can not since the license is in English.
            edition = (
                <div>
                    <p>{'Mattermost Team Edition. Upgrade to Mattermost Enterprise Edition to add the ability to unlock enterprise features.'}</p>
                    {this.state.upgradingPercentage !== 100 &&
                        <div>
                            <p>
                                <button
                                    type='button'
                                    onClick={this.handleUpgrade}
                                    className='btn btn-primary'
                                >
                                    <LoadingWrapper
                                        loading={this.state.upgradingPercentage > 0}
                                        text={
                                            <FormattedMessage
                                                id='admin.license.enterprise.upgrading'
                                                defaultMessage='Upgrading {percentage}%'
                                                values={{percentage: this.state.upgradingPercentage}}
                                            />
                                        }
                                    >
                                        <FormattedMessage
                                            id='admin.license.enterprise.upgrade'
                                            defaultMessage='Upgrade to Enterprise Edition'
                                        />
                                    </LoadingWrapper>
                                </button>
                            </p>
                            <p className='upgrade-legal-terms'>
                                <FormattedMarkdownMessage
                                    id='admin.license.enterprise.upgrade.accept-terms'
                                    defaultMessage='By clicking **Upgrade to Enterprise Edition**, I agree to the terms of the Mattermost Enterprise Edition License.'
                                />
                            </p>
                            {this.state.upgradeError &&
                                <div className='col-sm-12'>
                                    <div className='form-group has-error'>
                                        <label className='control-label'>
                                            <span dangerouslySetInnerHTML={{__html: format(this.state.upgradeError)}}/>
                                        </label>
                                    </div>
                                </div>}
                        </div>}
                    {this.state.upgradingPercentage === 100 &&
                        <div>
                            <p>
                                <FormattedMarkdownMessage
                                    id='admin.license.upgraded-restart'
                                    defaultMessage='You have upgraded your binary to mattermost enterprise, please restart the server to start using the new binary. You can do it right here:'
                                />
                            </p>
                            <p>
                                <button
                                    type='button'
                                    onClick={this.handleRestart}
                                    className='btn btn-primary'
                                >
                                    <LoadingWrapper
                                        loading={this.state.restarting}
                                        text={Utils.localizeMessage('admin.license.enterprise.restarting', 'Restarting')}
                                    >
                                        <FormattedMessage
                                            id='admin.license.enterprise.restart'
                                            defaultMessage='Restart Server'
                                        />
                                    </LoadingWrapper>
                                    {this.state.restartError &&
                                        <div className='col-sm-12'>
                                            <div className='form-group has-error'>
                                                <label className='control-label'>{this.state.restartError}</label>
                                            </div>
                                        </div>}
                                </button>
                            </p>
                        </div>}
                </div>
            );

            licenseType = (
                <div>
                    <p>{'When using Mattermost Team Edition, the software is offered under a Mattermost MIT Compiled License. See MIT-COMPILED-LICENSE.md in your root install directory for details.'}</p>
                    <p>{'When using Mattermost Enterprise Edition, the software is offered under a commercial license. See below for “Enterprise Edition License” for details.'}</p>
                    <p>{'See NOTICE.txt for information about open source software used in the system.'}</p>
                </div>
            );

            eelicense = this.renderEELicenseText();
        } else if (license.IsLicensed === 'true' && !uploading) {
            // Note: DO NOT LOCALISE THESE STRINGS. Legally we can not since the license is in English.
            const sku = license.SkuShortName ? <React.Fragment>{`Edition: Mattermost Enterprise Edition ${license.SkuShortName}`}<br/></React.Fragment> : null;
            edition = 'Mattermost Enterprise Edition. Enterprise features on this server have been unlocked with a license key and a valid subscription.';
            if (upgradedFromTE) {
                eelicense = this.renderEELicenseText();
            }
            licenseType = (
                <div>
                    {!upgradedFromTE &&
                        <p>
                            {'This software is offered under a commercial license.\n\nSee ENTERPRISE-EDITION-LICENSE.txt in your root install directory for details. See NOTICE.txt for information about open source software used in this system.\n\nYour subscription details are as follows:'}
                        </p>}
                    {upgradedFromTE &&
                        <div>
                            <p>{'When using Mattermost Enterprise Edition, the software is offered under a commercial license. See below for “Enterprise Edition License” for details.'}</p>
                            <p>{'See NOTICE.txt for information about open source software used in the system.'}</p>
                            <p>{'Your subscription details are as follows:'}</p>
                        </div>}
                    {`Name: ${license.Name}`}<br/>
                    {`Company or organization name: ${license.Company}`}<br/>
                    {sku}
                    {`Number of users: ${license.Users}`}<br/>
                    {'License issued: '}{issued}<br/>
                    {'Start date of license: '}{startsAt}<br/>
                    {'Expiry date of license: '}{expiresAt}<br/>
                    <br/>
                    {'See also '}
                    <a
                        rel='noopener noreferrer'
                        target='_blank'
                        href='https://about.mattermost.com/enterprise-edition-terms/'
                    >{'Enterprise Edition Terms of Service'}</a>{' and '}
                    <a
                        data-testid='privacyPolicyLink'
                        rel='noopener noreferrer'
                        target='_blank'
                        href='https://about.mattermost.com/default-privacy-policy/'
                    >{'Privacy Policy.'}</a>
                </div>
            );
            licenseContent = this.renderE10E20Content();
        } else {
            // Note: DO NOT LOCALISE THESE STRINGS. Legally we can not since the license is in English.
            edition = (
                <div>
                    {'Mattermost Enterprise Edition. A license is required to unlock enterprise features.'}
                    <p className='trial'>
                        <button
                            type='button'
                            className='btn btn-primary'
                            onClick={this.requestLicense}
                            disabled={isDisabled}
                        >
                            <LoadingWrapper
                                loading={this.state.gettingTrial}
                                text={Utils.localizeMessage('admin.license.trial-request.loading', 'Getting trial')}
                            >
                                <FormattedMessage
                                    id='admin.license.trial-request.submit'
                                    defaultMessage='Start trial'
                                />
                            </LoadingWrapper>
                        </button>
                    </p>
                    {gettingTrialError}
                    <p className='trial-legal-terms'>
                        <FormattedMarkdownMessage
                            id='admin.license.trial-request.accept-terms'
                            defaultMessage='By clicking **Start trial**, I agree to the [Mattermost Software Evaluation Agreement](!https://mattermost.com/software-evaluation-agreement/), [Privacy Policy](!https://mattermost.com/privacy-policy/), and receiving product emails.'
                        />
                    </p>
                </div>
            );

            if (upgradedFromTE) {
                licenseType = (
                    <div>
                        <p>{'When using Mattermost Enterprise Edition, the software is offered under a commercial license. See below for “Enterprise Edition License” for details.'}</p>
                        <p>{'See NOTICE.txt for information about open source software used in the system.'}</p>
                    </div>
                );
                eelicense = this.renderEELicenseText();
            } else {
                licenseType = 'This software is offered under a commercial license.\n\nSee ENTERPRISE-EDITION-LICENSE.txt in your root install directory for details. See NOTICE.txt for information about open source software used in this system.';
            }

            licenseContent = this.renderE0Content();
        }

        return (
            <div className='wrapper--fixed'>
                <FormattedAdminHeader
                    id='admin.license.title'
                    defaultMessage='Edition and License'
                />

                <div className='admin-console__wrapper'>
                    <div className='admin-console__content'>
                        <form
                            className='form-horizontal'
                            role='form'
                        >
                            <div className='form-group'>
                                <label
                                    className='control-label col-sm-4'
                                >
                                    <FormattedMessage
                                        id='admin.license.edition'
                                        defaultMessage='Edition: '
                                    />
                                </label>
                                <div className='col-sm-8'>
                                    {edition}
                                </div>
                            </div>
                            <div className='form-group'>
                                <label
                                    className='control-label col-sm-4'
                                >
                                    <FormattedMessage
                                        id='admin.license.type'
                                        defaultMessage='License: '
                                    />
                                </label>
                                <div className='col-sm-8'>
                                    {licenseType}
                                </div>
                            </div>
                            {licenseContent &&
                                <div className='form-group'>
                                    {licenseContent}
                                </div>}
                            {eelicense &&
                                <div className='form-group'>
                                    {eelicense}
                                </div>}
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    renderE10E20Content = () => {
        let removeButtonText = (
            <FormattedMessage
                id='admin.license.keyRemove'
                defaultMessage='Remove Enterprise License and Downgrade Server'
            />
        );
        if (this.state.removing) {
            removeButtonText = (
                <FormattedMessage
                    id='admin.license.removing'
                    defaultMessage='Removing License...'
                />
            );
        }

        return (
            <>
                <label
                    className='control-label col-sm-4'
                >
                    <FormattedMessage
                        id='admin.license.key'
                        defaultMessage='License Key: '
                    />
                </label>
                <div className='col-sm-8'>
                    <button
                        type='button'
                        className='btn btn-danger'
                        onClick={this.handleRemove}
                        disabled={this.props.isDisabled}
                        id='remove-button'
                    >
                        {removeButtonText}
                    </button>
                    <br/>
                    <br/>
                    <p className='help-text'>
                        {'If you migrate servers you may need to remove your license key to install it elsewhere. You can remove the key here, which will revert functionality to that of Team Edition.'}
                    </p>
                </div>
            </>
        );
    }

    renderE0Content = () => {
        let serverError = '';
        if (this.state.serverError) {
            serverError = <div className='col-sm-12'><div className='form-group has-error'><label className='control-label'>{this.state.serverError}</label></div></div>;
        }

        var btnClass = 'btn';
        if (this.state.fileSelected) {
            btnClass = 'btn btn-primary';
        }

        let fileName;
        if (this.state.fileName) {
            fileName = this.state.fileName;
        } else {
            fileName = (
                <FormattedMessage
                    id='admin.license.noFile'
                    defaultMessage='No file uploaded'
                />
            );
        }

        let uploadButtonText = (
            <FormattedMessage
                id='admin.license.upload'
                defaultMessage='Upload'
            />
        );
        if (this.state.uploading) {
            uploadButtonText = (
                <FormattedMessage
                    id='admin.license.uploading'
                    defaultMessage='Uploading License...'
                />
            );
        }
        return (
            <>
                <label
                    className='control-label col-sm-4'
                >
                    <FormattedMessage
                        id='admin.license.key'
                        defaultMessage='License Key: '
                    />
                </label>
                <div className='col-sm-8'>
                    <div className='file__upload'>
                        <button
                            type='button'
                            className='btn btn-primary'
                        >
                            <FormattedMessage
                                id='admin.license.choose'
                                defaultMessage='Choose File'
                            />
                        </button>
                        <input
                            ref='fileInput'
                            type='file'
                            accept='.mattermost-license'
                            onChange={this.handleChange}
                            disabled={this.props.isDisabled}
                        />
                    </div>
                    <button
                        className={btnClass}
                        disabled={this.props.isDisabled || !this.state.fileSelected}
                        onClick={this.handleSubmit}
                        id='upload-button'
                    >
                        {uploadButtonText}
                    </button>
                    <div className='help-text m-0'>
                        {fileName}
                    </div>
                    <br/>
                    {serverError}
                    <p className='help-text m-0'>
                        <FormattedMarkdownMessage
                            id='admin.license.uploadDesc'
                            defaultMessage='Upload a license key for Mattermost Enterprise Edition to upgrade this server. [Visit us online](!http://mattermost.com) to learn more about the benefits of Enterprise Edition or to purchase a key.'
                        />
                    </p>
                </div>
            </>
        );
    }

    renderEELicenseText = () => {
        return (
            <>
                <label
                    className='control-label col-sm-4'
                >
                    <FormattedMessage
                        id='admin.license.enterprise-edition-license'
                        defaultMessage='Enterprise Edition License:'
                    />
                </label>
                <div className='col-sm-8 enterprise-license-text'>
                    <div>
                        <p>{'The Mattermost Enterprise Edition (EE) license (the “EE License”)'}</p>
                        <p>{'Copyright (c) 2016-present Mattermost, Inc.'}</p>
                        <p>{'The subscription-only features of the Mattermost Enterprise Edition software and associated documentation files (the "Software") may only be used if you (and any entity that you represent) (i) have agreed to, and are in compliance with, the Mattermost Subscription Terms of Service, available at https://about.mattermost.com/enterprise-edition-terms/ (the “EE Terms”), and (ii) otherwise have a valid Mattermost Enterprise Edition subscription for the correct features, number of user seats and instances of Mattermost Enterprise Edition that you are running, accessing, or using.  You may, however, utilize the free version of the Software (with several features not enabled) under this license without a license key or subscription provided that you otherwise comply with the terms and conditions of this Agreement. Subject to the foregoing, except as explicitly permitted in the EE Terms, it is forbidden to copy, merge, modify, publish, distribute, sublicense, stream, perform, display, create derivative works of and/or sell the Software in either source or executable form without written agreement from Mattermost.  Notwithstanding anything to the contrary, free versions of the Software are provided “AS-IS” without indemnification, support, or warranties of any kind, expressed or implied. You assume all risk associated with any use of free versions of the Software.'}</p>
                        <p>{'EXCEPT AS OTHERWISE SET FORTH IN A BINDING WRITTEN AGREEMENT BETWEEN YOU AND MATTERMOST, THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.'}</p>
                    </div>
                </div>
            </>
        );
    }
}
/* eslint-enable react/no-string-refs */
