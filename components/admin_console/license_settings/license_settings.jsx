// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedDate, FormattedTime, FormattedMessage} from 'react-intl';

import * as Utils from 'utils/utils.jsx';

import * as AdminActions from 'actions/admin_actions.jsx';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper';

export default class LicenseSettings extends React.PureComponent {
    static propTypes = {
        license: PropTypes.object.isRequired,
        stats: PropTypes.object,
        actions: PropTypes.shape({
            getLicenseConfig: PropTypes.func.isRequired,
            uploadLicense: PropTypes.func.isRequired,
            removeLicense: PropTypes.func.isRequired,
            requestTrialLicense: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            fileSelected: false,
            fileName: null,
            serverError: null,
            gettingTrialError: null,
            gettingTrial: false,
            removing: false,
            uploading: false,
        };
    }

    componentDidMount() {
        this.props.actions.getLicenseConfig();
        AdminActions.getStandardAnalytics();
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

    requestLicense = async (e) => {
        e.preventDefault();
        this.setState({gettingTrial: true, gettingTrialError: null});
        const requestedUsers = Math.max(this.props.stats.TOTAL_USERS, 30);
        const {error} = await this.props.actions.requestTrialLicense(requestedUsers);
        if (error) {
            this.setState({gettingTrialError: error});
        }
        this.setState({gettingTrial: false});
        this.props.actions.getLicenseConfig();
    }

    render() {
        let serverError = '';
        if (this.state.serverError) {
            serverError = <div className='col-sm-12'><div className='form-group has-error'><label className='control-label'>{this.state.serverError}</label></div></div>;
        }
        let gettingTrialError = '';
        if (this.state.gettingTrialError) {
            gettingTrialError = <p className='form-group has-error'><label className='control-label'>{this.state.gettingTrialError}</label></p>;
        }

        var btnClass = 'btn';
        if (this.state.fileSelected) {
            btnClass = 'btn btn-primary';
        }

        const {license} = this.props;
        const {uploading} = this.state;

        let edition;
        let licenseType;
        let licenseKey;

        const issued = (
            <React.Fragment>
                <FormattedDate value={new Date(parseInt(license.IssuedAt, 10))}/>
                {' '}
                <FormattedTime value={new Date(parseInt(license.IssuedAt, 10))}/>
            </React.Fragment>
        );
        const startsAt = <FormattedDate value={new Date(parseInt(license.StartsAt, 10))}/>;
        const expiresAt = <FormattedDate value={new Date(parseInt(license.ExpiresAt, 10))}/>;

        if (license.IsLicensed === 'true' && !uploading) {
            // Note: DO NOT LOCALISE THESE STRINGS. Legally we can not since the license is in English.
            const sku = license.SkuShortName ? <React.Fragment>{`Edition: Mattermost Enterprise Edition ${license.SkuShortName}`}<br/></React.Fragment> : null;
            edition = 'Mattermost Enterprise Edition. Enterprise features on this server have been unlocked with a license key and a valid subscription.';
            licenseType = (
                <div>
                    <p>
                        {'This software is offered under a commercial license.\n\nSee ENTERPRISE-EDITION-LICENSE.txt in your root install directory for details. See NOTICE.txt for information about open source software used in this system.\n\nYour subscription details are as follows:'}
                    </p>
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
                        rel='noopener noreferrer'
                        target='_blank'
                        href='https://about.mattermost.com/default-privacy-policy/'
                    >{'Privacy Policy.'}</a>
                </div>
            );

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

            licenseKey = (
                <div className='col-sm-8'>
                    <button
                        className='btn btn-danger'
                        onClick={this.handleRemove}
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
            );
        } else {
            // Note: DO NOT LOCALISE THESE STRINGS. Legally we can not since the license is in English.
            edition = (
                <div>
                    {'Mattermost Enterprise Edition. A license is required to unlock enterprise features.'}
                    <p className='trial'>
                        <button
                            className='btn btn-primary'
                            onClick={this.requestLicense}
                        >
                            <LoadingWrapper
                                loading={this.state.gettingTrial}
                                text={Utils.localizeMessage('admin.license.trial-request.loading', 'Getting trial')}
                            >
                                <FormattedMessage
                                    id='admin.license.trial-request.submit'
                                    defaultMessage='Start a trial'
                                />
                            </LoadingWrapper>
                        </button>
                        {gettingTrialError}
                    </p>
                    <p className='help-text'>
                        <FormattedMessage
                            id='admin.license.trial-request.different-data'
                            defaultMessage='Or get a trial license manually at '
                        />
                        <a
                            target='_blank'
                            rel='noopener noreferrer'
                            href='https://mattermost.com/trial/?utm_medium=product&utm_source=product-trial'
                        >
                            {'https://mattermost.com/trial/'}
                        </a>
                    </p>
                </div>
            );

            licenseType = 'This software is offered under a commercial license.\n\nSee ENTERPRISE-EDITION-LICENSE.txt in your root install directory for details. See NOTICE.txt for information about open source software used in this system.';

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
            if (uploading) {
                uploadButtonText = (
                    <FormattedMessage
                        id='admin.license.uploading'
                        defaultMessage='Uploading License...'
                    />
                );
            }

            licenseKey = (
                <div className='col-sm-8'>
                    <div className='file__upload'>
                        <button className='btn btn-primary'>
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
                        />
                    </div>
                    <button
                        className={btnClass}
                        disabled={!this.state.fileSelected}
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
            );
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
                            <div className='form-group'>
                                <label
                                    className='control-label col-sm-4'
                                >
                                    <FormattedMessage
                                        id='admin.license.key'
                                        defaultMessage='License Key: '
                                    />
                                </label>
                                {licenseKey}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}
/* eslint-enable react/no-string-refs */