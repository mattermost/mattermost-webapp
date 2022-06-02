// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Modal} from 'react-bootstrap';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import styled from 'styled-components';

import {GlobalState} from 'types/store';

import {trackEvent} from 'actions/telemetry_actions';
import {CloudLinks, CloudProducts, ModalIdentifiers, TELEMETRY_CATEGORIES} from 'utils/constants';
import {getCloudContactUsLink, InquiryType} from 'selectors/cloud';
import {closeModal, openModal} from 'actions/views/modals';
import {
    getCloudSubscription as selectCloudSubscription,
    getSubscriptionProduct as selectSubscriptionProduct,
    getCloudProducts as selectCloudProducts} from 'mattermost-redux/selectors/entities/cloud';
import {isCurrentUserSystemAdmin} from 'mattermost-redux/selectors/entities/users';

import PurchaseModal from 'components/purchase_modal';
import {makeAsyncComponent} from 'components/async_load';
import StarMarkSvg from 'components/widgets/icons/star_mark_icon';
import CheckMarkSvg from 'components/widgets/icons/check_mark_icon';
import PlanLabel from 'components/common/plan_label';

import ContactSalesCTA from './contact_sales_cta';

const LearnMoreTrialModal = makeAsyncComponent('LearnMoreTrialModal', React.lazy(() => import('components/learn_more_trial_modal/learn_more_trial_modal')));

import LadySvg from './lady.svg';
import ManSvg from './man.svg';

import './content.scss';

type PlanBriefing = {
    title: string;
    items: string[];
}

enum ButtonCustomiserClasses {
    grayed = 'grayed',
    active = 'active',
    special = 'special',
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
    buttonDetails: ButtonDetails;
    planLabel?: JSX.Element;
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
                    <button
                        id={props.id + '_action'}
                        className={`plan_action_btn ${props.buttonDetails.disabled ? ButtonCustomiserClasses.grayed : props.buttonDetails.customClass}`}
                        disabled={props.buttonDetails.disabled}
                        onClick={props.buttonDetails.action}
                    >{props.buttonDetails.text}</button>
                </div>
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
    const {formatMessage} = useIntl();
    const dispatch = useDispatch();

    const isAdmin = useSelector(isCurrentUserSystemAdmin);
    const contactSalesLink = useSelector((state: GlobalState) => getCloudContactUsLink(state, InquiryType.Sales));

    const subscription = useSelector(selectCloudSubscription);
    const product = useSelector(selectSubscriptionProduct);
    const products = useSelector(selectCloudProducts);

    const isEnterprise = product?.sku === CloudProducts.ENTERPRISE;
    const isEnterpriseTrial = subscription?.is_free_trial === 'true';
    const professionalProduct = Object.values(products || {}).find(((product) => {
        return product.sku === CloudProducts.PROFESSIONAL;
    }));

    const isStarter = product?.sku === CloudProducts.STARTER;

    let isPostTrial = false;
    if ((subscription && subscription.trial_end_at > 0) && !isEnterpriseTrial && (isStarter || isEnterprise)) {
        isPostTrial = true;
    }

    const openPurchaseModal = () => {
        const utcTimeStamp = new Date().toISOString();
        trackEvent('cloud_admin', 'click_open_purchase_modal', {utcTimeStamp, epochTimeStamp: Date.parse(utcTimeStamp)});
        props.onHide();
        dispatch(openModal({
            modalId: ModalIdentifiers.CLOUD_PURCHASE,
            dialogType: PurchaseModal,
        }));
    };

    const openLearnMoreTrialModal = () => {
        const utcTimeStamp = new Date().toISOString();
        trackEvent('cloud_admin', 'open_learn_more_trial_modal', {utcTimeStamp, epochTimeStamp: Date.parse(utcTimeStamp)});
        props.onHide();
        dispatch(closeModal(ModalIdentifiers.CLOUD_PURCHASE)); // close the purchase modal if it's open
        dispatch(openModal({
            modalId: ModalIdentifiers.LEARN_MORE_TRIAL_MODAL,
            dialogType: LearnMoreTrialModal,
        }));
    };

    return (
        <div className='Content'>
            <Modal.Header className='PricingModal__header'>
                <div className='header_lhs'>
                    <h1 className='title'>
                        {formatMessage({id: 'pricing_modal.title', defaultMessage: 'Select a plan'})}
                    </h1>
                    <div>{'Choose a plan to get started'}</div>
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
                <div className='self-hosted-alert'>
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
                            items: [
                                formatMessage({id: 'pricing_modal.briefing.starter.recentMessageBoards', defaultMessage: 'Access to {messages} most recent messages, {boards} most recent board'}, {messages: '10,000', boards: '500'}),
                                formatMessage({id: 'pricing_modal.briefing.storage', defaultMessage: '{storage}GB file storage limit'}, {storage: '10'}),
                                formatMessage({id: 'pricing_modal.briefing.starter.oneTeamPerWorkspace', defaultMessage: 'One team per workspace'}),
                                formatMessage({id: 'pricing_modal.briefing.starter.integrations', defaultMessage: '{integrations} integrations with other apps like GitHub, Jira and Jenkins'}, {integrations: '5'}),
                            ],
                        }}
                        extraBriefing={{
                            title: formatMessage({id: 'pricing_modal.extra_briefing.title', defaultMessage: 'More features'}),
                            items: [
                                formatMessage({id: 'pricing_modal.extra_briefing.starter.calls', defaultMessage: '1:1 audio calls and screen share'}),
                            ],
                        }}
                        buttonDetails={{
                            action: () => {}, // noop until we support downgrade
                            text: formatMessage({id: 'pricing_modal.btn.upgrade', defaultMessage: 'Upgrade'}),
                            disabled: true, // disabled until we have functionality to downgrade
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
                            items: [
                                formatMessage({id: 'pricing_modal.briefing.professional.messageBoardsIntegrationsCalls', defaultMessage: 'Unlimited access to messages and boards history, teams, integrations and calls'}),
                                formatMessage({id: 'pricing_modal.briefing.storage', defaultMessage: '{storage}GB file storage limit'}, {storage: '250'}),
                                formatMessage({id: 'pricing_modal.briefing.professional.advancedPlaybook', defaultMessage: 'Advanced Playbook workflows with retrospectives'}),
                                formatMessage({id: 'pricing_modal.extra_briefing.professional.ssoSaml', defaultMessage: 'SSO with SAML 2.0, including Okta, OneLogin and ADFS'}),
                            ],
                        }}
                        extraBriefing={{
                            title: formatMessage({id: 'pricing_modal.extra_briefing.title', defaultMessage: 'More features'}),
                            items: [
                                formatMessage({id: 'pricing_modal.extra_briefing.professional.ssoadLdap', defaultMessage: 'SSO support with AD/LDAP, Google, O365, OpenID'}),
                                formatMessage({id: 'pricing_modal.extra_briefing.professional.guestAccess', defaultMessage: 'Guest access with MFA enforcement'}),
                            ],
                        }}
                        buttonDetails={{
                            action: openPurchaseModal,
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
                            items: [
                                formatMessage({id: 'pricing_modal.briefing.enterprise.unlimitedFileStorage', defaultMessage: 'Unlimited file storage'}),
                                formatMessage({id: 'pricing_modal.briefing.enterprise.groupSync', defaultMessage: 'AD/LDAP group sync'}),
                                formatMessage({id: 'pricing_modal.briefing.enterprise.mobileSecurity', defaultMessage: 'Advanced mobile security via ID-only push notifications'}),
                                formatMessage({id: 'pricing_modal.briefing.enterprise.rolesAndPermissions', defaultMessage: 'Advanced roles and permissions'}),
                                formatMessage({id: 'pricing_modal.briefing.enterprise.compliance', defaultMessage: 'Advanced compliance management'}),
                            ],
                        }}
                        extraBriefing={{
                            title: formatMessage({id: 'pricing_modal.extra_briefing.title', defaultMessage: 'More features'}),
                            items: [
                                formatMessage({id: 'pricing_modal.extra_briefing.enterprise.playBookAnalytics', defaultMessage: 'Playbook analytics dashboard'}),
                            ],
                        }}
                        planExtraInformation={(isPostTrial || !isAdmin) ? undefined : <ContactSalesCTA/>}
                        buttonDetails={(isPostTrial || !isAdmin) ? {
                            action: () => {
                                window.open(contactSalesLink, '_blank');
                            },
                            text: formatMessage({id: 'pricing_modal.btn.contactSales', defaultMessage: 'Contact Sales'}),
                            customClass: ButtonCustomiserClasses.active,
                        } : {
                            action: openLearnMoreTrialModal,
                            text: formatMessage({id: 'pricing_modal.btn.tryDays', defaultMessage: 'Try free for {days} days'}, {days: '30'}),
                            customClass: isEnterpriseTrial ? ButtonCustomiserClasses.grayed : ButtonCustomiserClasses.special,
                            disabled: isEnterpriseTrial,
                        }}
                    />
                </div>
            </Modal.Body>
        </div>
    );
}

export default Content;
