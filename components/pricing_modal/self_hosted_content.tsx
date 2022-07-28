// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {Modal} from 'react-bootstrap';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {CloudLinks, LicenseLinks, ModalIdentifiers, SelfHostedLicenseSKUNames, TELEMETRY_CATEGORIES} from 'utils/constants';

import {trackEvent} from 'actions/telemetry_actions';
import {closeModal} from 'actions/views/modals';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';
import {getLicense} from 'mattermost-redux/selectors/entities/general';
import {GlobalState} from '@mattermost/types/store';
import {getPrevTrialLicense} from 'mattermost-redux/actions/admin';

import CheckMarkSvg from 'components/widgets/icons/check_mark_icon';
import PlanLabel from 'components/common/plan_label';
import StartTrialBtn from 'components/learn_more_trial_modal/start_trial_btn';

import ContactSalesCTA from './contact_sales_cta';
import Card, {ButtonCustomiserClasses} from './card';

import './content.scss';

type ContentProps = {
    onHide: () => void;
}

function SelfHostedContent(props: ContentProps) {
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getPrevTrialLicense());
    }, []);

    const isAdmin = useSelector(isCurrentUserSystemAdmin);

    const license = useSelector(getLicense);
    const prevSelfHostedTrialLicense = useSelector((state: GlobalState) => state.entities.admin.prevTrialLicense);

    const isSelfHostedEnterpriseTrial = license.IsTrial === 'true';

    const isStarter = license.IsLicensed === 'false';
    const isProfessional = license.SkuShortName === SelfHostedLicenseSKUNames.PROFESSIONAL;
    const isEnterprise = license.SkuShortName === SelfHostedLicenseSKUNames.ENTERPRISE;
    const isPostSelfHostedEnterpriseTrial = prevSelfHostedTrialLicense.IsLicensed === 'true';

    const closePricingModal = () => {
        dispatch(closeModal(ModalIdentifiers.PRICING_MODAL));
    };

    const starterBriefing = [
        formatMessage({id: 'pricing_modal.briefing.unlimitedWorkspaceTeams', defaultMessage: 'Unlimited workspace teams'}),
        formatMessage({id: 'pricing_modal.briefing.unlimitedPlaybookRuns', defaultMessage: 'Unlimited playbooks and runs'}),
        formatMessage({id: 'pricing_modal.extra_briefing.starter.calls', defaultMessage: '1:1 voice calls and screen share'}),
        formatMessage({id: 'pricing_modal.briefing.fullMessageAndHistory', defaultMessage: 'Full message and file history'}),
        formatMessage({id: 'pricing_modal.briefing.ssoWithGitLab', defaultMessage: 'SSO with Gitlab'}),
    ];

    const professionalBriefing = [
        formatMessage({id: 'pricing_modal.briefing.customUserGroups', defaultMessage: 'Custom user groups'}),
        formatMessage({id: 'pricing_modal.briefing.voiceCallsScreenSharingInGroupMessagesAndChannels', defaultMessage: 'Voice calls and screen sharing in group messages and channels'}),
        formatMessage({id: 'pricing_modal.extra_briefing.professional.ssoSaml', defaultMessage: 'SSO with SAML 2.0, including Okta, OneLogin and ADFS'}),
        formatMessage({id: 'pricing_modal.extra_briefing.professional.ssoadLdap', defaultMessage: 'SSO support with AD/LDAP, Google, O365, OpenID'}),
        formatMessage({id: 'pricing_modal.extra_briefing.professional.guestAccess', defaultMessage: 'Guest access with MFA enforcement'}),

    ];

    const enterpriseBriefing = [
        formatMessage({id: 'pricing_modal.briefing.enterprise.groupSync', defaultMessage: 'AD/LDAP group sync'}),
        formatMessage({id: 'pricing_modal.briefing.enterprise.mobileSecurity', defaultMessage: 'Advanced mobile security via ID-only push notifications'}),
        formatMessage({id: 'pricing_modal.briefing.enterprise.rolesAndPermissions', defaultMessage: 'Advanced roles and permissions'}),
        formatMessage({id: 'pricing_modal.briefing.enterprise.advancedComplianceManagement', defaultMessage: 'Advanced compliance management'}),
        formatMessage({id: 'pricing_modal.briefing.enterprise.compliance', defaultMessage: 'Advanced compliance management'}),
        formatMessage({id: 'pricing_modal.extra_briefing.enterprise.playBookAnalytics', defaultMessage: 'Playbook analytics dashboard'}),
    ];

    const renderAlert = () => {
        return (<div className='alert-option'>
            <span>
                {formatMessage({id: 'pricing_modal.lookingForCloudOption', defaultMessage: 'Looking for a cloud option?'})}
            </span>
            <a
                onClick={() => {
                    trackEvent(
                        TELEMETRY_CATEGORIES.SELF_HOSTED_PURCHASING,
                        'click_looking_for_a_cloud_option',
                    );
                }
                }
                href={CloudLinks.CLOUD_SIGNUP_PAGE}
                rel='noopener noreferrer'
                target='_blank'
            >{formatMessage({id: 'pricing_modal.reviewDeploymentOptions', defaultMessage: 'Review deployment options'})}</a>
        </div>);
    };

    const trialButton = () => {
        return (
            <StartTrialBtn
                message={formatMessage({id: 'pricing_modal.btn.tryDays', defaultMessage: 'Try free for {days} days'}, {days: '30'})}
                telemetryId='start_trial_from_self_hosted_pricing_modal'
                renderAsButton={true}
                disabled={isSelfHostedEnterpriseTrial}
                btnClass={`plan_action_btn ${isSelfHostedEnterpriseTrial ? ButtonCustomiserClasses.grayed : ButtonCustomiserClasses.special}`}
                onClick={closePricingModal}
            />);
    };

    return (
        <div className='Content'>
            <Modal.Header className='PricingModal__header'>
                <div className='header_lhs'>
                    <h1 className='title'>
                        {formatMessage({id: 'pricing_modal.title', defaultMessage: 'Select a plan'})}
                    </h1>
                    <div>{formatMessage({id: 'pricing_modal.subtitle', defaultMessage: 'Choose a plan to get started'})}</div>
                </div>
                <button
                    id='closeIcon'
                    className='icon icon-close'
                    aria-label='Close'
                    title='Close'
                    onClick={() => {
                        trackEvent('self_hosted_pricing', 'close_pricing_modal');
                        props.onHide();
                    }}
                />
            </Modal.Header>
            <Modal.Body>
                {renderAlert()}
                <div className='PricingModal__body'>
                    <Card
                        id='starter'
                        topColor='#339970'
                        plan='Starter'
                        planSummary={formatMessage({id: 'pricing_modal.planSummary.starter', defaultMessage: 'Increased productivity for small teams'})}
                        price='$0'
                        rate={formatMessage({id: 'pricing_modal.price.freeForever', defaultMessage: 'Free forever'})}
                        planLabel={
                            isStarter ? (
                                <PlanLabel
                                    text={formatMessage({id: 'pricing_modal.planLabel.currentPlan', defaultMessage: 'CURRENT PLAN'})}
                                    color='var(--denim-status-online)'
                                    bgColor='var(--center-channel-bg)'
                                    firstSvg={<CheckMarkSvg/>}
                                />) : undefined}
                        buttonDetails={{
                            action: () => {},
                            text: formatMessage({id: 'pricing_modal.btn.downgrade', defaultMessage: 'Downgrade'}),
                            disabled: true,
                            customClass: ButtonCustomiserClasses.secondary,
                        }}
                        briefing={{
                            title: formatMessage({id: 'pricing_modal.briefing.starter.title', defaultMessage: 'Everything you need to get started'}),
                            items: starterBriefing,
                        }}
                    />
                    <Card
                        id='professional'
                        topColor='var(--denim-button-bg)'
                        plan='Professional'
                        planSummary={formatMessage({id: 'pricing_modal.planSummary.professional', defaultMessage: 'Scalable solutions for growing teams'})}
                        price='$10'
                        rate={formatMessage({id: 'pricing_modal.rate.userPerMonth', defaultMessage: '/user/month'})}
                        planLabel={
                            isProfessional ? (
                                <PlanLabel
                                    text={formatMessage({id: 'pricing_modal.planLabel.currentPlan', defaultMessage: 'CURRENT PLAN'})}
                                    color='var(--denim-status-online)'
                                    bgColor='var(--center-channel-bg)'
                                    firstSvg={<CheckMarkSvg/>}
                                />) : undefined}
                        buttonDetails={{
                            action: () => {
                                trackEvent('self_hosted_pricing', 'click_upgrade_button');
                                window.open(CloudLinks.SELF_HOSTED_SIGNUP, '_blank');
                            },
                            text: formatMessage({id: 'pricing_modal.btn.upgrade', defaultMessage: 'Upgrade'}),
                            disabled: !isAdmin || isProfessional,
                            customClass: isPostSelfHostedEnterpriseTrial ? ButtonCustomiserClasses.special : ButtonCustomiserClasses.active,
                        }}

                        briefing={{
                            title: formatMessage({id: 'pricing_modal.briefing.professional.title', defaultMessage: 'No limits on your team’s usage'}),
                            items: professionalBriefing,
                        }}
                    />
                    <Card
                        id='enterprise'
                        topColor='#E07315'
                        plan='Enterprise'
                        planSummary={formatMessage({id: 'pricing_modal.planSummary.enterprise', defaultMessage: 'Administration, security, and compliance for large teams'})}
                        planLabel={
                            isEnterprise ? (
                                <PlanLabel
                                    text={formatMessage({id: 'pricing_modal.planLabel.currentPlan', defaultMessage: 'CURRENT PLAN'})}
                                    color='var(--denim-status-online)'
                                    bgColor='var(--center-channel-bg)'
                                    firstSvg={<CheckMarkSvg/>}
                                    renderLastDaysOnTrial={true}
                                />) : undefined}
                        buttonDetails={(isPostSelfHostedEnterpriseTrial || !isAdmin) ? {
                            action: () => {
                                trackEvent('self_hosted_pricing', 'click_enterprise_contact_sales');
                                window.open(LicenseLinks.CONTACT_SALES, '_blank');
                            },
                            text: formatMessage({id: 'pricing_modal.btn.contactSales', defaultMessage: 'Contact Sales'}),
                            customClass: ButtonCustomiserClasses.active,
                        } : undefined}
                        customButtonDetails={(!isPostSelfHostedEnterpriseTrial && isAdmin) ? (
                            trialButton()
                        ) : undefined}
                        contactSalesCTA={(isPostSelfHostedEnterpriseTrial || !isAdmin) ? undefined : <ContactSalesCTA/>}
                        briefing={{
                            title: formatMessage({id: 'pricing_modal.briefing.enterprise.title', defaultMessage: 'Features for large-scale collaboration'}),
                            items: enterpriseBriefing,
                        }}
                    />
                </div>
            </Modal.Body>
        </div>
    );
}

export default SelfHostedContent;
