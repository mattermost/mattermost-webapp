// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Modal} from 'react-bootstrap';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';

import {CloudLinks, CloudProducts, ModalIdentifiers, NonAdminPaidFeatures, TELEMETRY_CATEGORIES} from 'utils/constants';
import {fallbackStarterLimits, fallbackProfessionalLimits, asGBString, hasSomeLimits} from 'utils/limits';

import {getCloudContactUsLink, InquiryType} from 'selectors/cloud';

import {trackEvent} from 'actions/telemetry_actions';
import {closeModal, openModal} from 'actions/views/modals';
import {subscribeCloudSubscription} from 'actions/cloud';
import {
    getCloudSubscription as selectCloudSubscription,
    getSubscriptionProduct as selectSubscriptionProduct,
    getCloudProducts as selectCloudProducts} from 'mattermost-redux/selectors/entities/cloud';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import useGetUsage from 'components/common/hooks/useGetUsage';
import useGetLimits from 'components/common/hooks/useGetLimits';
import SuccessModal from 'components/cloud_subscribe_result_modal/success';
import ErrorModal from 'components/cloud_subscribe_result_modal/error';
import CheckMarkSvg from 'components/widgets/icons/check_mark_icon';
import PlanLabel from 'components/common/plan_label';
import CloudStartTrialButton from 'components/cloud_start_trial/cloud_start_trial_btn';
import NotifyAdminCTA from 'components/notify_admin_cta/notify_admin_cta';
import useOpenCloudPurchaseModal from 'components/common/hooks/useOpenCloudPurchaseModal';

import DowngradeTeamRemovalModal from './downgrade_team_removal_modal';
import ContactSalesCTA from './contact_sales_cta';
import StarterDisclaimerCTA from './starter_disclaimer_cta';
import StartTrialCaution from './start_trial_caution';
import Card, {ButtonCustomiserClasses} from './card';

import './content.scss';

type ContentProps = {
    onHide: () => void;

    // callerCTA is information about the cta that opened this modal. This helps us provide a telemetry path
    // showing information about how the modal was opened all the way to more CTAs within the modal itself
    callerCTA?: string;
}

function Content(props: ContentProps) {
    const {formatMessage, formatNumber} = useIntl();
    const dispatch = useDispatch();
    const usage = useGetUsage();
    const [limits] = useGetLimits();

    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const contactSalesLink = useSelector(getCloudContactUsLink)(InquiryType.Sales);

    const subscription = useSelector(selectCloudSubscription);
    const product = useSelector(selectSubscriptionProduct);
    const products = useSelector(selectCloudProducts);

    const isEnterprise = product?.sku === CloudProducts.ENTERPRISE;
    const isEnterpriseTrial = subscription?.is_free_trial === 'true';
    const professionalProduct = Object.values(products || {}).find(((product) => {
        return product.sku === CloudProducts.PROFESSIONAL;
    }));
    const starterProduct = Object.values(products || {}).find(((product) => {
        return product.sku === CloudProducts.STARTER;
    }));

    const isStarter = product?.sku === CloudProducts.STARTER;
    const isProfessional = product?.sku === CloudProducts.PROFESSIONAL;

    const isPreTrial = subscription?.trial_end_at === 0;

    let isPostTrial = false;
    if ((subscription && subscription.trial_end_at > 0) && !isEnterpriseTrial && (isStarter || isEnterprise)) {
        isPostTrial = true;
    }

    const openCloudPurchaseModal = useOpenCloudPurchaseModal({});
    const openPurchaseModal = (callerInfo: string) => {
        props.onHide();
        const telemetryInfo = props.callerCTA + ' > ' + callerInfo;
        openCloudPurchaseModal({trackingLocation: telemetryInfo});
    };

    const closePricingModal = () => {
        dispatch(closeModal(ModalIdentifiers.PRICING_MODAL));
    };

    const downgrade = async () => {
        if (!starterProduct) {
            return;
        }

        const result = await dispatch(subscribeCloudSubscription(starterProduct.id));

        if (typeof result === 'boolean' && result) {
            dispatch(closeModal(ModalIdentifiers.CLOUD_DOWNGRADE_CHOOSE_TEAM));
            dispatch(
                openModal({
                    modalId: ModalIdentifiers.SUCCESS_MODAL,
                    dialogType: SuccessModal,
                }),
            );
        } else {
            dispatch(
                openModal({
                    modalId: ModalIdentifiers.ERROR_MODAL,
                    dialogType: ErrorModal,
                }),
            );
            return;
        }

        props.onHide();
    };

    const hasLimits = hasSomeLimits(limits);

    const starterBriefing = [
        formatMessage({id: 'pricing_modal.briefing.starter.recentMessageBoards', defaultMessage: 'Access to {messages} most recent messages, {boards} most recent board cards'}, {messages: formatNumber(fallbackStarterLimits.messages.history), boards: fallbackStarterLimits.boards.cards}),
        formatMessage({id: 'pricing_modal.briefing.storage', defaultMessage: '{storage} file storage limit'}, {storage: asGBString(fallbackStarterLimits.files.totalStorage, formatNumber)}),
        formatMessage({id: 'pricing_modal.briefing.starter.oneTeamPerWorkspace', defaultMessage: 'One team per workspace'}),
        formatMessage({id: 'pricing_modal.briefing.starter.integrations', defaultMessage: '{integrations} integrations with other apps like GitHub, Jira and Jenkins'}, {integrations: fallbackStarterLimits.integrations.enabled}),
        formatMessage({id: 'pricing_modal.extra_briefing.starter.calls', defaultMessage: '1:1 voice calls and screen share'}),
    ];

    const legacyStarterBriefing = [
        formatMessage({id: 'admin.billing.subscription.planDetails.features.groupAndOneToOneMessaging', defaultMessage: 'Group and one-to-one messaging, file sharing, and search'}),
        formatMessage({id: 'admin.billing.subscription.planDetails.features.incidentCollaboration', defaultMessage: 'Incident collaboration'}),
        formatMessage({id: 'admin.billing.subscription.planDetails.features.unlimittedUsersAndMessagingHistory', defaultMessage: 'Unlimited users & message history'}),
        formatMessage({id: 'admin.billing.subscription.planDetails.features.mfa', defaultMessage: 'Multi-Factor Authentication (MFA)'}),
    ];

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
                    onClick={props.onHide}
                />
            </Modal.Header>
            <Modal.Body>
                <div className='alert-option'>
                    <span>{formatMessage({id: 'pricing_modal.lookingToSelfHost', defaultMessage: 'Looking to self-host?'})}</span>
                    <a
                        onClick={() =>
                            trackEvent(
                                TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
                                'click_looking_to_self_host',
                            )
                        }
                        href={CloudLinks.DEPLOYMENT_OPTIONS}
                        rel='noopener noreferrer'
                        target='_blank'
                    >{formatMessage({id: 'pricing_modal.reviewDeploymentOptions', defaultMessage: 'Review deployment options'})}</a>
                </div>
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
                        planExtraInformation={<StarterDisclaimerCTA/>}
                        buttonDetails={{
                            action: () => {
                                if (!starterProduct) {
                                    return;
                                }
                                if (usage.teams.active > 1) {
                                    dispatch(
                                        openModal({
                                            modalId: ModalIdentifiers.CLOUD_DOWNGRADE_CHOOSE_TEAM,
                                            dialogType: DowngradeTeamRemovalModal,
                                            dialogProps: {
                                                product_id: starterProduct?.id,
                                                starterProduct,
                                            },
                                        }),
                                    );
                                } else {
                                    downgrade();
                                }
                            },
                            text: formatMessage({id: 'pricing_modal.btn.downgrade', defaultMessage: 'Downgrade'}),
                            disabled: isStarter || isEnterprise || !isAdmin,
                            customClass: ButtonCustomiserClasses.secondary,
                        }}
                        briefing={{
                            title: formatMessage({id: 'pricing_modal.briefing.title', defaultMessage: 'Top features'}),
                            items: hasLimits ? starterBriefing : legacyStarterBriefing,
                        }}
                    />

                    <Card
                        id='professional'
                        topColor='var(--denim-button-bg)'
                        plan='Professional'
                        planSummary={formatMessage({id: 'pricing_modal.planSummary.professional', defaultMessage: 'Scalable solutions for growing teams'})}
                        price={`$${professionalProduct ? professionalProduct.price_per_seat : '10'}`}
                        rate={formatMessage({id: 'pricing_modal.rate.userPerMonth', defaultMessage: '/user/month'})}
                        planLabel={
                            isProfessional ? (
                                <PlanLabel
                                    text={formatMessage({id: 'pricing_modal.planLabel.currentPlan', defaultMessage: 'CURRENT PLAN'})}
                                    color='var(--denim-status-online)'
                                    bgColor='var(--center-channel-bg)'
                                    firstSvg={<CheckMarkSvg/>}
                                />) : undefined}
                        planExtraInformation={(!isAdmin && (isStarter || isEnterpriseTrial)) ? (
                            <NotifyAdminCTA
                                preTrial={isPreTrial}
                                notifyRequestData={{
                                    required_feature: NonAdminPaidFeatures.ALL_PROFESSIONAL_FEATURES,
                                    required_plan: CloudProducts.PROFESSIONAL,
                                    trial_notification: isPreTrial}}
                                callerInfo='professional_plan_pricing_modal_card'
                            />) : undefined}
                        buttonDetails={{
                            action: () => openPurchaseModal('click_pricing_modal_professional_card_upgrade_button'),
                            text: formatMessage({id: 'pricing_modal.btn.upgrade', defaultMessage: 'Upgrade'}),
                            disabled: !isAdmin || isProfessional || (isEnterprise && !isEnterpriseTrial),
                            customClass: isPostTrial ? ButtonCustomiserClasses.special : ButtonCustomiserClasses.active,
                        }}
                        briefing={{
                            title: formatMessage({id: 'pricing_modal.briefing.title', defaultMessage: 'Top features'}),
                            items: [
                                formatMessage({id: 'pricing_modal.briefing.professional.messageBoardsIntegrationsCalls', defaultMessage: 'Unlimited access to messages and boards history, teams, integrations and calls'}),
                                formatMessage({id: 'pricing_modal.briefing.storage', defaultMessage: '{storage} file storage limit'}, {storage: asGBString(fallbackProfessionalLimits.files.totalStorage, formatNumber)}),
                                formatMessage({id: 'pricing_modal.briefing.professional.advancedPlaybook', defaultMessage: 'Advanced Playbook workflows with retrospectives'}),
                                formatMessage({id: 'pricing_modal.extra_briefing.professional.ssoSaml', defaultMessage: 'SSO with SAML 2.0, including Okta, OneLogin and ADFS'}),
                                formatMessage({id: 'pricing_modal.extra_briefing.professional.ssoadLdap', defaultMessage: 'SSO support with AD/LDAP, Google, O365, OpenID'}),
                                formatMessage({id: 'pricing_modal.extra_briefing.professional.guestAccess', defaultMessage: 'Guest access with MFA enforcement'}),
                            ],
                        }}
                        planAddonsInfo={{
                            title: formatMessage({id: 'pricing_modal.addons.title', defaultMessage: 'Available Add-ons'}),
                            items: [
                                {
                                    title: formatMessage({id: 'pricing_modal.addons.professionalPlusSupport', defaultMessage: 'Professional-Plus Support'}),
                                    items: [
                                        formatMessage({id: 'pricing_modal.addons.247Coverage', defaultMessage: '24x7 coverage'}),
                                        formatMessage({id: 'pricing_modal.addons.4hourL1L2Response', defaultMessage: '4 hour L1&L2 response'}),
                                    ],
                                },
                            ],
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
                        planExtraInformation={(!isAdmin && (isStarter || isEnterpriseTrial)) ? (
                            <NotifyAdminCTA
                                preTrial={isPreTrial}
                                callerInfo='enterprise_plan_pricing_modal_card'
                                notifyRequestData={{
                                    required_feature: NonAdminPaidFeatures.ALL_ENTERPRISE_FEATURES,
                                    required_plan: CloudProducts.ENTERPRISE,
                                    trial_notification: isPreTrial}}
                            />) : undefined}
                        buttonDetails={(isPostTrial || !isAdmin) ? {
                            action: () => {
                                trackEvent('cloud_pricing', 'click_enterprise_contact_sales');
                                window.open(contactSalesLink, '_blank');
                            },
                            text: formatMessage({id: 'pricing_modal.btn.contactSales', defaultMessage: 'Contact Sales'}),
                            customClass: ButtonCustomiserClasses.active,
                        } : undefined}
                        customButtonDetails={(!isPostTrial && isAdmin) ? (
                            <CloudStartTrialButton
                                message={formatMessage({id: 'pricing_modal.btn.tryDays', defaultMessage: 'Try free for {days} days'}, {days: '30'})}
                                telemetryId='start_cloud_trial_from_pricing_modal'
                                disabled={isEnterprise || isEnterpriseTrial || isProfessional}
                                extraClass={`plan_action_btn ${(isEnterprise || isEnterpriseTrial || isProfessional) ? ButtonCustomiserClasses.grayed : ButtonCustomiserClasses.special}`}
                                afterTrialRequest={closePricingModal}
                            />
                        ) : undefined}
                        planTrialDisclaimer={(!isPostTrial && isAdmin) ? <StartTrialCaution/> : undefined}
                        contactSalesCTA={(isPostTrial || !isAdmin) ? undefined : <ContactSalesCTA/>}
                        briefing={{
                            title: formatMessage({id: 'pricing_modal.briefing.title', defaultMessage: 'Top features'}),
                            items: [
                                formatMessage({id: 'pricing_modal.briefing.enterprise.unlimitedFileStorage', defaultMessage: 'Unlimited file storage'}),
                                formatMessage({id: 'pricing_modal.briefing.enterprise.groupSync', defaultMessage: 'AD/LDAP group sync'}),
                                formatMessage({id: 'pricing_modal.briefing.enterprise.mobileSecurity', defaultMessage: 'Advanced mobile security via ID-only push notifications'}),
                                formatMessage({id: 'pricing_modal.briefing.enterprise.rolesAndPermissions', defaultMessage: 'Advanced roles and permissions'}),
                                formatMessage({id: 'pricing_modal.briefing.enterprise.compliance', defaultMessage: 'Advanced compliance management'}),
                                formatMessage({id: 'pricing_modal.extra_briefing.enterprise.playBookAnalytics', defaultMessage: 'Playbook analytics dashboard'}),
                            ],
                        }}
                        planAddonsInfo={{
                            title: formatMessage({id: 'pricing_modal.addons.title', defaultMessage: 'Available Add-ons'}),
                            items: [
                                {title: formatMessage({id: 'pricing_modal.addons.premiumSupport', defaultMessage: 'Premium support'})},
                                {title: formatMessage({id: 'pricing_modal.addons.missionCritical', defaultMessage: 'Mission-critical 24x7'})},
                                {title: '1hr-L1, 2hr-L2'},
                                {title: formatMessage({id: 'pricing_modal.addons.licensing4', defaultMessage: 'Licensing for up to 4 standalone, non-production environments'})},
                                {title: formatMessage({id: 'pricing_modal.addons.USSupport', defaultMessage: 'U.S.- only based support'})},
                                {title: formatMessage({id: 'pricing_modal.addons.dedicatedDeployment', defaultMessage: 'Dedicated virtual secure cloud deployment (Cloud)'})},
                                {title: formatMessage({id: 'pricing_modal.addons.dedicatedK8sCluster', defaultMessage: 'Dedicated Kubernetes cluster'})},
                                {title: formatMessage({id: 'pricing_modal.addons.dedicatedDB', defaultMessage: 'Dedicated database'})},
                                {title: formatMessage({id: 'pricing_modal.addons.dedicatedEncryption', defaultMessage: 'Dedicated encryption keys 99%'})},
                                {title: formatMessage({id: 'pricing_modal.addons.uptimeGuarantee', defaultMessage: '99% uptime guarantee'})},
                                {title: formatMessage({id: 'pricing_modal.addons.multiServerLicensing', defaultMessage: 'Multi-server licensing (Self-Hosted)'})},
                            ],
                        }}
                    />
                </div>
            </Modal.Body>
        </div>
    );
}

export default Content;
