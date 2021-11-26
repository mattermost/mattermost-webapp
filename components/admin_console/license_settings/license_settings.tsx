// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable react/no-string-refs */
/* eslint-disable header/header */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
import React from 'react';
import {FormattedDate, FormattedTime} from 'react-intl';

import {ClientConfig, ClientLicense} from 'mattermost-redux/types/config';
import {ActionResult} from 'mattermost-redux/types/actions';
import {StatusOK} from 'mattermost-redux/types/client4';

import * as Utils from 'utils/utils.jsx';
import {isLicenseExpired, isLicenseExpiring, isTrialLicense} from 'utils/license_utils.jsx';

import * as AdminActions from 'actions/admin_actions.jsx';
import {trackEvent} from 'actions/telemetry_actions';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';

import {AboutLinks, CloudLinks, ModalIdentifiers} from 'utils/constants';

import {ModalData} from 'types/actions';

import RenewLinkCard from './renew_license_card/renew_license_card';
import TrialLicenseCard from './trial_license_card/trial_license_card';

import TeamEditionLeftPanel from './team_edition/team_edition_left_panel';
import TeamEditionRightPanel from './team_edition/team_edition_right_panel';
import StarterLeftPanel from './starter_edition/starter_left_panel';
import StarterRightPanel from './starter_edition/starter_right_panel';
import EnterpriseEditionLeftPanel from './enterprise_edition/enterprise_edition_left_panel';
import EnterpriseEditionRightPanel from './enterprise_edition/enterprise_edition_right_panel';
import EELicenseModal from './ee_license_modal/ee_license_modal';
import TrialBanner from './trial_banner/trial_banner';

import './license_settings.scss';

type Props = {
    license: ClientLicense;
    enterpriseReady: boolean;
    upgradedFromTE: boolean;
    stats: any;
    config: Partial<ClientConfig>;
    isDisabled: boolean;
    prevTrialLicense: ClientLicense;
    actions: {
        getLicenseConfig: () => void;
        uploadLicense: (file: File) => Promise<ActionResult>;
        removeLicense: () => Promise<ActionResult>;
        getPrevTrialLicense: () => void;
        upgradeToE0: () => Promise<StatusOK>;
        upgradeToE0Status: () => Promise<ActionResult>;
        restartServer: () => Promise<StatusOK>;
        ping: () => Promise<{status: string}>;
        requestTrialLicense: (users: number, termsAccepted: boolean, receiveEmailsAccepted: boolean, featureName: string) => Promise<ActionResult>;
        openModal: <P>(modalData: ModalData<P>) => void;
    };
}

type State = {
    fileSelected: boolean;
    fileName: string | null;
    serverError: string | null;
    gettingTrialError: string | null;
    gettingTrial: boolean;
    removing: boolean;
    uploading: boolean;
    upgradingPercentage: number;
    upgradeError: string | null;
    restarting: boolean;
    restartError: string | null;
};
export default class LicenseSettings extends React.PureComponent<Props, State> {
    private fileInputRef: React.RefObject<HTMLInputElement>;
    private interval: ReturnType<typeof setInterval> | null;

    constructor(props: Props) {
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

        this.fileInputRef = React.createRef();
    }

    componentDidMount() {
        if (this.props.enterpriseReady) {
            this.props.actions.getPrevTrialLicense();
        } else {
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
        const {data: percentage, error} = await this.props.actions.upgradeToE0Status();
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
        this.setState({upgradingPercentage: percentage || 0, upgradeError: error as string});
    }

    handleChange = () => {
        const element = this.fileInputRef.current;
        if (element !== null && element.files !== null) {
            if (element.files.length > 0) {
                this.setState({fileSelected: true, fileName: element.files[0].name});
            }
        }
    }

    handleSubmit = async (e: any) => {
        e.preventDefault();

        const element = this.fileInputRef.current;
        if (!element || (element && element.files?.length === 0)) {
            return;
        }
        const files = element.files;
        const file = files && files.length > 0 ? files[0] : null;

        if (file === null) {
            return;
        }

        this.setState({uploading: true});

        const {error} = await this.props.actions.uploadLicense(file);
        if (error) {
            Utils.clearFileInput(element);
            this.setState({fileSelected: false, fileName: null, serverError: error.message, uploading: false});
            return;
        }

        await this.props.actions.getLicenseConfig();
        this.setState({fileSelected: false, fileName: null, serverError: null, uploading: false});
    }

    openEELicenseModal = async () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.ENTERPRISE_EDITION_LICENSE,
            dialogType: EELicenseModal,
        });
    };

    handleRemove = async (e: any) => {
        e.preventDefault();

        this.setState({removing: true});

        const {error} = await this.props.actions.removeLicense();
        if (error) {
            this.setState({fileSelected: false, fileName: null, serverError: error.message, removing: false});
            return;
        }

        this.props.actions.getPrevTrialLicense();
        await this.props.actions.getLicenseConfig();
        this.setState({fileSelected: false, fileName: null, serverError: null, removing: false});
    }

    handleUpgrade = async (e?: any) => {
        if (e) {
            e.preventDefault();
        }
        if (this.state.upgradingPercentage > 0) {
            return;
        }
        try {
            await this.props.actions.upgradeToE0();
            this.setState({upgradingPercentage: 1});
            await this.reloadPercentage();
        } catch (error: any) {
            trackEvent('api', 'upgrade_to_e0_failed', {error: error.message as string});
            this.setState({upgradeError: error.message, upgradingPercentage: 0});
        }
    }

    requestLicense = async (e?: any) => {
        if (e) {
            e.preventDefault();
        }
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

    handleRestart = async (e?: any) => {
        if (e) {
            e.preventDefault();
        }
        this.setState({restarting: true});
        try {
            await this.props.actions.restartServer();
        } catch (err) {
            this.setState({restarting: false, restartError: err as string});
        }
        setTimeout(this.checkRestarted, 1000);
    }

    currentPlan = (
        <div className='current-plan-legend'>
            <i className='icon-check-circle'/>
            {'Current Plan'}
        </div>
    );

    createLink = (link: string, text: string) => {
        return (
            <a
                target='_blank'
                id='privacyLink'
                rel='noopener noreferrer'
                href={link}
            >
                {text}
            </a>
        );
    }

    termsAndPolicy = (
        <div className='terms-and-policy'>
            {'See also '}
            {this.createLink(AboutLinks.TERMS_OF_SERVICE, 'Enterprise Edition Terms of Service')}
            {' and '}
            {this.createLink(AboutLinks.PRIVACY_POLICY, 'Privacy Policy')}
        </div>
    );

    comparePlans = (
        <div className='compare-plans-text'>
            {'Curious about upgrading? '}
            {this.createLink(CloudLinks.PRICING, 'Compare Plans')}
        </div>
    );

    render() {
        const {license, upgradedFromTE, isDisabled} = this.props;
        const {uploading} = this.state;

        const issued = (
            <>
                <FormattedDate value={new Date(parseInt(license.IssuedAt, 10))}/>
                {' '}
                <FormattedTime value={new Date(parseInt(license.IssuedAt, 10))}/>
            </>
        );
        const startsAt = <FormattedDate value={new Date(parseInt(license.StartsAt, 10))}/>;
        const expiresAt = <FormattedDate value={new Date(parseInt(license.ExpiresAt, 10))}/>;

        let leftPanel = null;
        let rightPanel = null;

        if (!this.props.enterpriseReady) { // Team Edition
            // Note: DO NOT LOCALISE THESE STRINGS. Legally we can not since the license is in English.
            leftPanel = (
                <TeamEditionLeftPanel
                    openEELicenseModal={this.openEELicenseModal}
                    currentPlan={this.currentPlan}
                />
            );

            rightPanel = (
                <TeamEditionRightPanel
                    upgradingPercentage={this.state.upgradingPercentage}
                    upgradeError={this.state.upgradeError}
                    restartError={this.state.restartError}
                    handleRestart={this.handleRestart}
                    handleUpgrade={this.handleUpgrade}
                    restarting={this.state.restarting}
                    openEEModal={this.openEELicenseModal}
                />
            );
        } else if (license.IsLicensed === 'true' && !uploading) {
            // Note: DO NOT LOCALISE THESE STRINGS. Legally we can not since the license is in English.
            leftPanel = (
                <EnterpriseEditionLeftPanel
                    openEELicenseModal={this.openEELicenseModal}
                    upgradedFromTE={upgradedFromTE}
                    license={license}
                    isTrialLicense={isTrialLicense(license)}
                    issued={issued}
                    startsAt={startsAt}
                    expiresAt={expiresAt}
                    handleRemove={this.handleRemove}
                    isDisabled={isDisabled}
                    removing={this.state.removing}
                />
            );

            rightPanel = (
                <EnterpriseEditionRightPanel
                    isTrialLicense={isTrialLicense(license)}
                    license={license}
                />
            );
        } else {
            // Note: DO NOT LOCALISE THESE STRINGS. Legally we can not since the license is in English.
            // This is Mattermost Starter (Already downloaded the binary but no license has been set, or ended the trial period)
            leftPanel = (
                <StarterLeftPanel
                    openEELicenseModal={this.openEELicenseModal}
                    currentPlan={this.currentPlan}
                    upgradedFromTE={this.props.upgradedFromTE}
                    serverError={this.state.serverError}
                    fileSelected={this.state.fileSelected}
                    fileName={this.state.fileName}
                    uploading={this.state.uploading}
                    fileInputRef={this.fileInputRef}
                    isDisabled={this.props.isDisabled}
                    handleChange={this.handleChange}
                    handleSubmit={this.handleSubmit}
                />
            );

            rightPanel = (
                <StarterRightPanel/>
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
                        <div className='admin-console__banner_section'>
                            {
                                <TrialBanner
                                    isDisabled={isDisabled}
                                    gettingTrialError={this.state.gettingTrialError}
                                    requestLicense={this.requestLicense}
                                    gettingTrial={this.state.gettingTrial}
                                    enterpriseReady={this.props.enterpriseReady}
                                    upgradingPercentage={this.state.upgradingPercentage}
                                    handleUpgrade={this.handleUpgrade}
                                    upgradeError={this.state.upgradeError}
                                    restartError={this.state.restartError}
                                    handleRestart={this.handleRestart}
                                    restarting={this.state.restarting}
                                    openEEModal={this.openEELicenseModal}
                                />
                            }
                            {this.renewLicenseCard()}
                        </div>
                        <div className='top-wrapper'>
                            <div className='left-panel'>
                                <div className='panel-card'>
                                    {leftPanel}
                                </div>
                                {(!isTrialLicense(license)) && this.termsAndPolicy}
                            </div>
                            <div className='right-panel'>
                                <div className='panel-card'>
                                    {rightPanel}
                                </div>
                                {this.comparePlans}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renewLicenseCard = () => {
        const {isDisabled} = this.props;
        if (isTrialLicense(this.props.license)) {
            return (
                <TrialLicenseCard
                    license={this.props.license}
                />
            );
        }
        if (isLicenseExpired(this.props.license) || isLicenseExpiring(this.props.license)) {
            return (
                <RenewLinkCard
                    license={this.props.license}
                    isLicenseExpired={isLicenseExpired(this.props.license)}
                    totalUsers={this.props.stats.TOTAL_USERS}
                    isDisabled={isDisabled}
                />
            );
        }
        return null;
    }
}
/* eslint-enable react/no-string-refs */
