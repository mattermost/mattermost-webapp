// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable max-lines */

import React from 'react';
import {Modal} from 'react-bootstrap';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import {CloudLinks, CloudProducts, ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';
import {fallbackStarterLimits, fallbackProfessionalLimits, asGBString} from 'utils/limits';

import {getCloudContactUsLink, InquiryType} from 'selectors/cloud';

import {trackEvent} from 'actions/telemetry_actions';
import {closeModal, openModal} from 'actions/views/modals';
import {subscribeCloudSubscription} from 'actions/cloud';
import {
    getCloudSubscription as selectCloudSubscription,
    getSubscriptionProduct as selectSubscriptionProduct,
    getCloudProducts as selectCloudProducts,
    isCurrentLicenseCloud} from 'mattermost-redux/selectors/entities/cloud';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import useGetUsage from 'components/common/hooks/useGetUsage';
import SuccessModal from 'components/cloud_subscribe_result_modal/success';
import ErrorModal from 'components/cloud_subscribe_result_modal/error';
import PurchaseModal from 'components/purchase_modal';
import StarMarkSvg from 'components/widgets/icons/star_mark_icon';
import CheckMarkSvg from 'components/widgets/icons/check_mark_icon';
import PlanLabel from 'components/common/plan_label';
import CloudStartTrialButton from 'components/cloud_start_trial/cloud_start_trial_btn';
import NotifyAdminCTA from 'components/notify_admin_cta/notify_admin_cta';

import DowngradeTeamRemovalModal from './downgrade_team_removal_modal';
import ContactSalesCTA from './contact_sales_cta';
import StarterDisclaimerCTA from './starter_disclaimer_cta';
import StartTrialCaution from './start_trial_caution';

import LadySvg from './lady.svg';
import ManSvg from './man.svg';

import './content.scss';
import StartTrialBtn from 'components/learn_more_trial_modal/start_trial_btn';

type PlanBriefing = {
    title: string;
    items: string[];
}

enum ButtonCustomiserClasses {
    grayed = 'grayed',
    active = 'active',
    special = 'special',
    secondary = 'secondary',
}

type ButtonDetails = {
    action: () => void;
    text: string;
    disabled?: boolean;
    customClass?: ButtonCustomiserClasses;
}

type CardProps = {
    id: string;
    topColor: string;
    plan: string;
    price: string;
    rate?: string;
    briefing: PlanBriefing;
    extraBriefing: PlanBriefing;
    planExtraInformation?: JSX.Element;
    buttonDetails?: ButtonDetails;
    customButtonDetails?: JSX.Element;
    planLabel?: JSX.Element;
    planDisclaimer?: JSX.Element;
}

type ContentProps = {
    onHide: () => void;
}

type StyledProps = {
    bgColor?: string;
    color?: string;
}

const StyledDiv = styled.div<StyledProps>`
background-color: ${(props) => props.bgColor};
`;

function Card(props: CardProps) {
    return (
        <div
            id={props.id}
            className='PlanCard'
        >
            {props.planLabel && props.planLabel}
            <StyledDiv
                className='top'
                bgColor={props.topColor}
            />
            <div className='bottom'>
                <div className='plan_price_rate_section'>
                    <h4>{props.plan}</h4>
                    <h1 className={props.plan === 'Enterprise' ? 'enterprise_price' : ''}>{props.price}</h1>
                    <p>{props.rate}</p>
                </div>
                <div className='plan_briefing'>
                    <div>
                        <span className='title'>{props.briefing.title}</span>
                        {props.briefing.items.map((i) => {
                            return (
                                <div
                                    className='item'
                                    key={i}
                                >
                                    <i className='fa fa-circle bullet'/><p>{i}</p>
                                </div>
                            );
                        })}
                    </div>
                    {props.planExtraInformation && props.planExtraInformation}
                </div>
                <div>
                    {props.customButtonDetails ? props.customButtonDetails : (
                        <button
                            id={props.id + '_action'}
                            className={`plan_action_btn ${props.buttonDetails?.disabled ? ButtonCustomiserClasses.grayed : props.buttonDetails?.customClass}`}
                            disabled={props.buttonDetails?.disabled}
                            onClick={props.buttonDetails?.action}
                        >
                            {props.buttonDetails?.text}
                        </button>
                    )}
                </div>
                {props.planDisclaimer && props.planDisclaimer}
                <div className='plan_extra_briefing'>
                    <div>
                        <span className='title'>{props.extraBriefing.title}</span>
                        {props.extraBriefing.items.map((i) => {
                            return (
                                <div
                                    className='item'
                                    key={i}
                                >
                                    <i className='fa fa-circle bullet'/><p>{i}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Content(props: ContentProps) {
    const {formatMessage, formatNumber} = useIntl();
    const dispatch = useDispatch();
    const usage = useGetUsage();

    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const isCloud = useSelector(isCurrentLicenseCloud);
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

    let isPostTrial = false;
    if ((subscription && subscription.trial_end_at > 0) && !isEnterpriseTrial && (isStarter || isEnterprise)) {
        isPostTrial = true;
    }

    const professionalBtnAction = () => {
        if (isCloud) {
            openPurchaseModal();
        } else {
            window.open('https://customers.mattermost.com/', '_blank');
        }
    };

    const openPurchaseModal = () => {
        trackEvent('cloud_pricing', 'click_upgrade_button');
        props.onHide();
        dispatch(openModal({
            modalId: ModalIdentifiers.CLOUD_PURCHASE,
            dialogType: PurchaseModal,
        }));
    };

    const closePricingModal = () => {
        dispatch(closeModal(ModalIdentifiers.PRICING_MODAL));
    };

    const downgrade = async () => {
        if (!starterProduct) {
            return;
        }

        const result = await dispatch(subscribeCloudSubscription(starterProduct?.id));

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

    const CloudBriefing = {
        starter: [
            formatMessage({id: 'pricing_modal.briefing.starter.recentMessageBoards', defaultMessage: 'Access to {messages} most recent messages, {boards} most recent board cards'}, {messages: formatNumber(fallbackStarterLimits.messages.history), boards: fallbackStarterLimits.boards.cards}),
            formatMessage({id: 'pricing_modal.briefing.storage', defaultMessage: '{storage} file storage limit'}, {storage: asGBString(fallbackStarterLimits.files.totalStorage, formatNumber)}),
            formatMessage({id: 'pricing_modal.briefing.starter.oneTeamPerWorkspace', defaultMessage: 'One team per workspace'}),
            formatMessage({id: 'pricing_modal.briefing.starter.integrations', defaultMessage: '{integrations} integrations with other apps like GitHub, Jira and Jenkins'}, {integrations: fallbackStarterLimits.integrations.enabled}),
        ],
        professional: [
            formatMessage({id: 'pricing_modal.briefing.professional.messageBoardsIntegrationsCalls', defaultMessage: 'Unlimited access to messages and boards history, teams, integrations and calls'}),
            formatMessage({id: 'pricing_modal.briefing.storage', defaultMessage: '{storage} file storage limit'}, {storage: asGBString(fallbackProfessionalLimits.files.totalStorage, formatNumber)}),
            formatMessage({id: 'pricing_modal.briefing.professional.advancedPlaybook', defaultMessage: 'Advanced Playbook workflows with retrospectives'}),
            formatMessage({id: 'pricing_modal.extra_briefing.professional.ssoSaml', defaultMessage: 'SSO with SAML 2.0, including Okta, OneLogin and ADFS'}),
        ],
        enterprise: [
            formatMessage({id: 'pricing_modal.briefing.enterprise.unlimitedFileStorage', defaultMessage: 'Unlimited file storage'}),
            formatMessage({id: 'pricing_modal.briefing.enterprise.groupSync', defaultMessage: 'AD/LDAP group sync'}),
            formatMessage({id: 'pricing_modal.briefing.enterprise.mobileSecurity', defaultMessage: 'Advanced mobile security via ID-only push notifications'}),
            formatMessage({id: 'pricing_modal.briefing.enterprise.rolesAndPermissions', defaultMessage: 'Advanced roles and permissions'}),
            formatMessage({id: 'pricing_modal.briefing.enterprise.compliance', defaultMessage: 'Advanced compliance management'}),
        ],
    };

    const CloudExtraBriefing = {
        starter: [
            formatMessage({id: 'pricing_modal.extra_briefing.starter.calls', defaultMessage: '1:1 voice calls and screen share'}),
        ],
        professional: [
            formatMessage({id: 'pricing_modal.extra_briefing.professional.ssoadLdap', defaultMessage: 'SSO support with AD/LDAP, Google, O365, OpenID'}),
            formatMessage({id: 'pricing_modal.extra_briefing.professional.guestAccess', defaultMessage: 'Guest access with MFA enforcement'}),
        ],
        enterprise: [
            formatMessage({id: 'pricing_modal.extra_briefing.enterprise.playBookAnalytics', defaultMessage: 'Playbook analytics dashboard'}),
        ],
    };

    const SelfHostedBriefing = {
        starter: [
            formatMessage({id: 'pricing_modal.briefing.unlimitedWorkspaceTeams', defaultMessage: 'Unlimited workspace teams'}),
            formatMessage({id: 'pricing_modal.briefing.unlimitedPlaybookRuns', defaultMessage: 'Unlimited playbooks and runs'}),
            formatMessage({id: 'pricing_modal.extra_briefing.starter.calls', defaultMessage: '1:1 voice calls and screen share'}),
            formatMessage({id: 'pricing_modal.briefing.fullMessageAndHistory', defaultMessage: 'Full message and file history'}),
        ],
        professional: [
            formatMessage({id: 'pricing_modal.briefing.customUserGroups', defaultMessage: 'Custom user groups'}),
            formatMessage({id: 'pricing_modal.briefing.voiceCallsScreenSharingInGroupMessagesAndChannels', defaultMessage: 'Voice calls and screen sharing in group messages and channels'}),
            formatMessage({id: 'pricing_modal.extra_briefing.professional.ssoSaml', defaultMessage: 'SSO with SAML 2.0, including Okta, OneLogin and ADFS'}),
        ],
        enterprise: [
            formatMessage({id: 'pricing_modal.briefing.enterprise.groupSync', defaultMessage: 'AD/LDAP group sync'}),
            formatMessage({id: 'pricing_modal.briefing.enterprise.mobileSecurity', defaultMessage: 'Advanced mobile security via ID-only push notifications'}),
            formatMessage({id: 'pricing_modal.briefing.enterprise.rolesAndPermissions', defaultMessage: 'Advanced roles and permissions'}),
        ],
    };

    const SelfHostedExtraBriefing = {
        starter: [
            formatMessage({id: 'pricing_modal.briefing.ssoWithGitLab', defaultMessage: 'SSO with Gitlab'}),
        ],
        professional: [
            formatMessage({id: 'pricing_modal.extra_briefing.professional.ssoadLdap', defaultMessage: 'SSO support with AD/LDAP, Google, O365, OpenID'}),
            formatMessage({id: 'pricing_modal.extra_briefing.professional.guestAccess', defaultMessage: 'Guest access with MFA enforcement'}),
        ],
        enterprise: [
            formatMessage({id: 'pricing_modal.briefing.enterprise.compliance', defaultMessage: 'Advanced compliance management'}),
            formatMessage({id: 'pricing_modal.extra_briefing.enterprise.playBookAnalytics', defaultMessage: 'Playbook analytics dashboard'}),
        ],
    };

    const renderAlert = () => {
        return (<div className='alert'>
            <span>
                {
                    isCloud ? formatMessage({id: 'pricing_modal.lookingToSelfHost', defaultMessage: 'Looking to self-host?'}) : formatMessage({id: 'pricing_modal.lookingForCloudOption', defaultMessage: 'Looking for a cloud option?'})
                }
            </span>
            <a
                onClick={() => {
                    if (isCloud) {
                        trackEvent(
                            TELEMETRY_CATEGORIES.CLOUD_PURCHASING,
                            'click_looking_to_self_host',
                        );
                    } else {
                        trackEvent(
                            TELEMETRY_CATEGORIES.SELF_HOSTED_PURCHASING,
                            'click_looking_for_a_cloud_option',
                        );
                    }
                }
                }
                href={isCloud ? CloudLinks.DEPLOYMENT_OPTIONS : 'https://mattermost.com/sign-up/'}
                rel='noopener noreferrer'
                target='_blank'
            >{formatMessage({id: 'pricing_modal.reviewDeploymentOptions', defaultMessage: 'Review deployment options'})}</a>
        </div>);
    };

    const trialButton = (): JSX.Element => {
        if (isCloud) {
            return (
                <CloudStartTrialButton
                    message={formatMessage({id: 'pricing_modal.btn.tryDays', defaultMessage: 'Try free for {days} days'}, {days: '30'})}
                    telemetryId='start_cloud_trial_from_pricing_modal'
                    disabled={isEnterpriseTrial}
                    extraClass={`plan_action_btn ${isEnterpriseTrial ? ButtonCustomiserClasses.grayed : ButtonCustomiserClasses.special}`}
                    afterTrialRequest={closePricingModal}
                />
            );
        }

        return (
            <StartTrialBtn
                message={formatMessage({id: 'pricing_modal.btn.tryDays', defaultMessage: 'Try free for {days} days'}, {days: '30'})}
                telemetryId='start_trial_from_learn_more_about_trial_modal'
                renderAsButton={true}
                disabled={isEnterpriseTrial}
                btnClass={`plan_action_btn ${isEnterpriseTrial ? ButtonCustomiserClasses.grayed : ButtonCustomiserClasses.special}`}
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
                    onClick={props.onHide}
                />
            </Modal.Header>
            <Modal.Body>
                {renderAlert()}
                <div className='PricingModal__body'>
                    <div className='self-hosted-svg-left'>
                        <LadySvg/>
                    </div>
                    <div className='self-hosted-svg-right'>
                        <ManSvg/>
                    </div>
                    <Card
                        id='starter'
                        topColor='#9DA7B8'
                        plan='Starter'
                        price={formatMessage({id: 'pricing_modal.price.free', defaultMessage: 'Free'})}
                        briefing={{
                            title: formatMessage({id: 'pricing_modal.briefing.title', defaultMessage: 'Top features'}),
                            items: isCloud ? CloudBriefing.starter : SelfHostedBriefing.starter,
                        }}
                        extraBriefing={{
                            title: formatMessage({id: 'pricing_modal.extra_briefing.title', defaultMessage: 'More features'}),
                            items: isCloud ? CloudExtraBriefing.starter : SelfHostedExtraBriefing.starter,
                        }}
                        planExtraInformation={isCloud ? <StarterDisclaimerCTA/> : undefined}
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
                                                starterProductName: starterProduct?.name,
                                            },
                                        }),
                                    );
                                } else {
                                    downgrade();
                                }
                            },
                            text: formatMessage({id: 'pricing_modal.btn.downgrade', defaultMessage: 'Downgrade'}),
                            disabled: isStarter || !isAdmin || !isCloud,
                            customClass: ButtonCustomiserClasses.secondary,
                        }}
                        planLabel={
                            isStarter ? (
                                <PlanLabel
                                    text={formatMessage({id: 'pricing_modal.planLabel.currentPlan', defaultMessage: 'CURRENT PLAN'})}
                                    color='var(--denim-status-online)'
                                    bgColor='var(--center-channel-bg)'
                                    firstSvg={<CheckMarkSvg/>}
                                />) : undefined}
                    />
                    <Card
                        id='professional'
                        topColor='#4A69AC'
                        plan='Professional'
                        price={`$${professionalProduct ? professionalProduct.price_per_seat : '10'}`}
                        rate={formatMessage({id: 'pricing_modal.rate.userPerMonth', defaultMessage: '/user/month'})}
                        briefing={{
                            title: formatMessage({id: 'pricing_modal.briefing.title', defaultMessage: 'Top features'}),
                            items: isCloud ? CloudBriefing.professional : SelfHostedBriefing.professional,
                        }}
                        extraBriefing={{
                            title: formatMessage({id: 'pricing_modal.extra_briefing.title', defaultMessage: 'More features'}),
                            items: isCloud ? CloudExtraBriefing.professional : SelfHostedExtraBriefing.professional,
                        }}
                        planExtraInformation={(!isAdmin && (isEnterpriseTrial || isStarter)) ? <NotifyAdminCTA/> : undefined}
                        buttonDetails={{
                            action: professionalBtnAction,
                            text: formatMessage({id: 'pricing_modal.btn.upgrade', defaultMessage: 'Upgrade'}),
                            disabled: !isAdmin,
                            customClass: isPostTrial ? ButtonCustomiserClasses.special : ButtonCustomiserClasses.active,
                        }}
                        planLabel={
                            <PlanLabel
                                text={formatMessage({id: 'pricing_modal.planLabel.mostPopular', defaultMessage: 'MOST POPULAR'})}
                                bgColor='var(--title-color-indigo-500)'
                                color='var(--button-color)'
                                firstSvg={<StarMarkSvg/>}
                                secondSvg={<StarMarkSvg/>}
                            />}
                    />
                    <Card
                        id='enterprise'
                        topColor='var(--denim-button-bg)'
                        plan='Enterprise'
                        price={formatMessage({id: 'pricing_modal.price.contactSales', defaultMessage: 'Contact sales'})}
                        briefing={{
                            title: formatMessage({id: 'pricing_modal.briefing.title', defaultMessage: 'Top features'}),
                            items: isCloud ? CloudBriefing.enterprise : SelfHostedBriefing.enterprise,
                        }}
                        extraBriefing={{
                            title: formatMessage({id: 'pricing_modal.extra_briefing.title', defaultMessage: 'More features'}),
                            items: isCloud ? CloudExtraBriefing.enterprise : SelfHostedExtraBriefing.enterprise,
                        }}
                        planExtraInformation={(isPostTrial || !isAdmin) ? undefined : <ContactSalesCTA/>}
                        buttonDetails={(isPostTrial || !isAdmin) ? {
                            action: () => {
                                trackEvent('cloud_pricing', 'click_enterprise_contact_sales');
                                window.open(contactSalesLink, '_blank');
                            },
                            text: formatMessage({id: 'pricing_modal.btn.contactSales', defaultMessage: 'Contact Sales'}),
                            customClass: ButtonCustomiserClasses.active,
                        } : undefined}
                        customButtonDetails={(!isPostTrial && isAdmin) ? (
                            trialButton()
                        ) : undefined}
                        planDisclaimer={<StartTrialCaution/>}
                    />
                </div>
            </Modal.Body>
        </div>
    );
}

export default Content;
