// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {ClientLicense} from '@mattermost/types/config';
import {ActionResult} from 'mattermost-redux/types/actions';
import {StatusOK} from '@mattermost/types/client4';

import {isLicenseExpired, isLicenseExpiring, isTrialLicense, isEnterpriseOrE20License, licenseSKUWithFirstLetterCapitalized} from 'utils/license_utils';

import {trackEvent} from 'actions/telemetry_actions';

import {GetFilteredUsersStatsOpts, UsersStats} from '@mattermost/types/users';
import {ServerError} from '@mattermost/types/errors';

import FormattedAdminHeader from 'components/widgets/admin_console/formatted_admin_header';
import ExternalLink from 'components/external_link';

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
import TrialBanner from './trial_banner/trial_banner';
import EELicenseModal from './modals/ee_license_modal';
import UploadLicenseModal from './modals/upload_license_modal';
import ConfirmLicenseRemovalModal from './modals/confirm_license_removal_modal';

import './license_settings.scss';

type Props = {
    license: ClientLicense;
    enterpriseReady: boolean;
    upgradedFromTE: boolean;
    totalUsers: number;
    isDisabled: boolean;
    prevTrialLicense: ClientLicense;
    actions: {
        getLicenseConfig: () => void;
        uploadLicense: (file: File) => Promise<ActionResult>;
        removeLicense: () => Promise<ActionResult>;
        getPrevTrialLicense: () => void;
        upgradeToE0: () => Promise<StatusOK>;
        upgradeToE0Status: () => Promise<{percentage: number; error: string | JSX.Element}>;
        restartServer: () => Promise<StatusOK>;
        ping: () => Promise<{status: string}>;
        requestTrialLicense: (users: number, termsAccepted: boolean, receiveEmailsAccepted: boolean, featureName: string) => Promise<ActionResult>;
        openModal: <P>(modalData: ModalData<P>) => void;
        getFilteredUsersStats: (filters: GetFilteredUsersStatsOpts) => Promise<{
            data?: UsersStats;
            error?: ServerError;
        }>;
    };
}

type State = {
    fileSelected: boolean;
    file: File | null;
    serverError: string | null;
    gettingTrialError: string | null;
    gettingTrialResponseCode: number | null;
    gettingTrial: boolean;
    removing: boolean;
    upgradingPercentage: number;
    upgradeError: string | null;
    restarting: boolean;
    restartError: string | null;
    clickNormalUpgradeBtn: boolean;
};
export default class LicenseSettings extends React.PureComponent<Props, State> {
    private interval: ReturnType<typeof setInterval> | null;
    private fileInputRef: React.RefObject<HTMLInputElement>;
    constructor(props: Props) {
        super(props);

        this.interval = null;
        this.state = {
            fileSelected: false,
            file: null,
            serverError: null,
            gettingTrialResponseCode: null,
            gettingTrialError: null,
            gettingTrial: false,
            removing: false,
            upgradingPercentage: 0,
            upgradeError: null,
            restarting: false,
            restartError: null,
            clickNormalUpgradeBtn: false,
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
        this.props.actions.getFilteredUsersStats({include_bots: false, include_deleted: false});
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (prevState.fileSelected !== this.state.fileSelected && this.state.fileSelected) {
            this.props.actions.openModal({
                modalId: ModalIdentifiers.UPLOAD_LICENSE,
                dialogType: UploadLicenseModal,
                dialogProps: {
                    fileObjFromProps: this.state.file,
                },
            });
        }
        this.setState({fileSelected: false, file: null});
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
        this.setState({upgradingPercentage: percentage || 0, upgradeError: error as string});
    }

    handleChange = () => {
        const element = this.fileInputRef.current;
        if (element?.files?.length) {
            this.setState({fileSelected: true, file: element.files[0]});
        }
    }

    openEELicenseModal = async () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.ENTERPRISE_EDITION_LICENSE,
            dialogType: EELicenseModal,
        });
    };

    confirmLicenseRemoval = async () => {
        this.props.actions.openModal({
            modalId: ModalIdentifiers.CONFIRM_LICENSE_REMOVAL,
            dialogType: ConfirmLicenseRemovalModal,
            dialogProps: {handleRemove: this.handleRemove, currentLicenseSKU: licenseSKUWithFirstLetterCapitalized(this.props.license)},
        });
    };

    handleRemove = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        this.setState({removing: true});

        const {error} = await this.props.actions.removeLicense();
        if (error) {
            this.setState({serverError: error.message, removing: false});
            return;
        }

        this.props.actions.getPrevTrialLicense();
        await this.props.actions.getLicenseConfig();
        this.setState({serverError: null, removing: false});
    }

    handleUpgrade = async (e?: React.MouseEvent<HTMLButtonElement>) => {
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

    requestLicense = async (e?: React.MouseEvent<HTMLButtonElement>) => {
        if (e) {
            e.preventDefault();
        }
        if (this.state.gettingTrial) {
            return;
        }
        this.setState({gettingTrial: true, gettingTrialError: null});
        const requestedUsers = Math.max(this.props.totalUsers, 30) || 30;
        const {error, data} = await this.props.actions.requestTrialLicense(requestedUsers, true, true, 'license');
        if (error) {
            this.setState({gettingTrialError: error});
        }
        this.setState({gettingTrial: false, gettingTrialResponseCode: data?.status});
        await this.props.actions.getLicenseConfig();
    }

    checkRestarted = () => {
        this.props.actions.ping().then(() => {
            window.location.reload();
        }).catch(() => {
            setTimeout(this.checkRestarted, 1000);
        });
    }

    handleRestart = async (e?: React.MouseEvent<HTMLButtonElement>) => {
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

    setClickNormalUpgradeBtn = () => {
        this.setState({clickNormalUpgradeBtn: true});
    }

    currentPlan = (
        <div className='current-plan-legend'>
            <i className='icon-check-circle'/>
            {'Current Plan'}
        </div>
    );

    createLink = (link: string, text: string) => {
        return (
            <ExternalLink
                location='license_settings'
                id='privacyLink'
                href={link}
            >
                {text}
            </ExternalLink>
        );
    }

    termsAndPolicy = (
        <div className='terms-and-policy'>
            {'See also '}
            {this.createLink(AboutLinks.TERMS_OF_SERVICE, 'Enterprise Edition Terms of Use')}
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
                    setClickNormalUpgradeBtn={this.setClickNormalUpgradeBtn}
                />
            );
        } else if (license.IsLicensed === 'true') {
            // Note: DO NOT LOCALISE THESE STRINGS. Legally we can not since the license is in English.
            leftPanel = (
                <EnterpriseEditionLeftPanel
                    openEELicenseModal={this.openEELicenseModal}
                    upgradedFromTE={upgradedFromTE}
                    license={license}
                    isTrialLicense={isTrialLicense(license)}
                    handleRemove={this.confirmLicenseRemoval}
                    isDisabled={isDisabled}
                    removing={this.state.removing}
                    fileInputRef={this.fileInputRef}
                    handleChange={this.handleChange}
                    statsActiveUsers={this.props.totalUsers || 0}
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
                    fileInputRef={this.fileInputRef}
                    handleChange={this.handleChange}
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
                            {!this.state.clickNormalUpgradeBtn && license.IsLicensed !== 'true' &&
                                this.props.prevTrialLicense?.IsLicensed !== 'true' &&
                                <TrialBanner
                                    isDisabled={isDisabled}
                                    gettingTrialResponseCode={this.state.gettingTrialResponseCode}
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
                                {!isEnterpriseOrE20License(license) && this.comparePlans}
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
                    totalUsers={this.props.totalUsers}
                    isDisabled={isDisabled}
                />
            );
        }
        return null;
    }
}
