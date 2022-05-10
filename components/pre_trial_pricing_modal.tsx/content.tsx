// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Modal} from 'react-bootstrap';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';

import {GlobalState} from '@mattermost/types/store';

import {trackEvent} from 'actions/telemetry_actions';
import {CloudLinks, CloudProducts, TELEMETRY_CATEGORIES} from 'utils/constants';

import './content.scss';
import LadySvg from './lady.svg';
import ManSvg from './man.svg';

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
    topColor: string;
    plan: string;
    price: string;
    rate?: string;
    briefing: PlanBriefing;
    planDisclaimer?: string;
    buttonDetails: ButtonDetails;
    extraAction?: ButtonDetails;
    planLabel?: JSX.Element;
}

type PlanLabelProps = {
    text: string;
    bgColor: string;
    color: string;
    firstSvg: JSX.Element;
    secondSvg?: JSX.Element;
}

function CheckMarkSvg() {
    return (
        <svg
            width='16'
            height='16'
            viewBox='0 0 16 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M8 0.493804C6.644 0.493804 5.384 0.835804 4.22 1.5198C3.08 2.1798 2.18 3.0798 1.52 4.2198C0.836 5.3838 0.494 6.6438 0.494 7.9998C0.494 9.3558 0.836 10.6158 1.52 11.7798C2.18 12.9198 3.08 13.8198 4.22 14.4798C5.384 15.1638 6.644 15.5058 8 15.5058C9.356 15.5058 10.616 15.1638 11.78 14.4798C12.92 13.8198 13.82 12.9198 14.48 11.7798C15.164 10.6158 15.506 9.3558 15.506 7.9998C15.506 6.6438 15.164 5.3838 14.48 4.2198C13.82 3.0798 12.92 2.1798 11.78 1.5198C10.616 0.835804 9.356 0.493804 8 0.493804ZM6.686 11.5098L5.624 10.4658L3.5 8.3418L4.562 7.2798L6.686 9.4038L11.456 4.6158L12.518 5.6778L6.686 11.5098Z'
                fill='#3DB887'
            />
        </svg>
    );
}

function StarMarkSvg() {
    return (
        <svg
            width='12'
            height='12'
            viewBox='0 0 12 12'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <path
                d='M6.55906 9.74587C6.5135 9.72672 6.45882 9.72672 6.41325 9.74587L3.30554 11C3.22352 11.0191 3.15973 11 3.09593 10.9617C3.04125 10.9234 3.01391 10.8564 3.01391 10.7702L3.18707 7.26632C3.18707 7.21845 3.16884 7.16101 3.1415 7.11314L1.04539 4.38468C0.999826 4.31767 0.981599 4.25065 1.00894 4.18364C1.03628 4.11662 1.08185 4.06876 1.14564 4.03046L4.37182 3.1114C4.41739 3.1114 4.46296 3.08268 4.4903 3.03481L6.313 0.105309C6.35857 0.0382942 6.42236 0 6.49527 0C6.56818 0 6.63197 0.0382942 6.67754 0.105309L8.50024 3.03481C8.51847 3.08268 8.55492 3.12097 8.61872 3.14012L11.8267 4.03046C11.9087 4.06876 11.9634 4.11662 11.9816 4.18364C12.0089 4.25065 11.9907 4.31767 11.9451 4.38468L9.86727 7.11314C9.83081 7.16101 9.8217 7.21845 9.8217 7.26632L9.99486 10.7607C9.99486 10.8468 9.9584 10.9138 9.89461 10.9521C9.83081 10.9904 9.76702 11.0096 9.70322 10.9904L6.55906 9.74587Z'
                fill='#FFBC1F'
            />
        </svg>

    );
}

function PlanLabel(props: PlanLabelProps) {
    return (
        <div
            className='planLabel'
            style={{
                backgroundColor: props.bgColor,
                color: props.color,
            }}
        >
            {props.firstSvg}
            {props.text}
            {props.secondSvg}
        </div>
    );
}

function Card(props: CardProps) {
    return (
        <div className='PlanCard'>
            {props.planLabel && props.planLabel}
            <div
                className='top'
                style={{backgroundColor: props.topColor}}
            />
            <div className='bottom'>
                <div className='plan_price_rate_section'>
                    <h4>{props.plan}</h4>
                    <h1 className={props.plan === 'Enterprise' ? 'enterprise_price' : ''}>{props.price}</h1>
                    <p>{props.rate}</p>
                </div>
                <div className='plan_briefing'>
                    <h4>{props.briefing.title}</h4>
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
                    {props.planDisclaimer && (
                        <p className='disclaimer'><i className='icon-alert-outline'/>{props.planDisclaimer}</p>
                    )}
                </div>
                <div>
                    <button
                        className={'plan_action_btn ' + props.buttonDetails.customClass}
                        disabled={props.buttonDetails.disabled}
                        onClick={props.buttonDetails.action}
                    >{props.buttonDetails.text}</button>
                </div>

                {props.extraAction && (
                    <button
                        className='plan_action_btn'
                        onClick={props.extraAction?.action}
                    >{props.extraAction?.text}</button>
                )}
            </div>
        </div>
    );
}

function Content() {
    const {formatMessage} = useIntl();

    const subscription = useSelector((state: GlobalState) => state.entities.cloud.subscription);
    const product = useSelector((state: GlobalState) => {
        if (state.entities.cloud.products && subscription) {
            return state.entities.cloud.products[subscription?.product_id];
        }
        return undefined;
    });

    let isStarter = false;
    if (product?.sku === CloudProducts.STARTER) {
        isStarter = true;
    }
    return (
        <div className='Content'>
            <div className='self-hosted-alert'>
                <h1>{formatMessage({id: 'pretrial_pricing_modal.lookingToSelfHost', defaultMessage: 'Looking to self-host?'})}</h1>
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
                >{formatMessage({id: 'pretrial_pricing_modal.reviewDeploymentOptions', defaultMessage: 'Review deployment options'})}</a>
            </div>
            <Modal.Header className='PreTrialPricingModal__header'>
                <h1 className='title'>
                    {formatMessage({id: 'pretrial_pricing_modal.title', defaultMessage: 'Select a plan'})}
                </h1>
                <button
                    id='closeIcon'
                    className='icon icon-close'
                    aria-label='Close'
                    title='Close'
                    onClick={() => {}}
                />
            </Modal.Header>
            <Modal.Body className='PreTrialPricingModal__body'>
                <div className='self-hosted-svg-left'>
                    <LadySvg/>
                </div>
                <div className='self-hosted-svg-right'>
                    <ManSvg/>
                </div>
                <Card
                    topColor='#9DA7B8'
                    plan='Starter'
                    price={formatMessage({id: 'pretrial_pricing_modal.price.free', defaultMessage: 'Free'})}
                    briefing={{
                        title: formatMessage({id: 'pretrial_pricing_modal.briefing.starter', defaultMessage: 'Starter comes with...'}),
                        items: [
                            formatMessage({id: 'pretrial_pricing_modal.briefing.storage', defaultMessage: '{storage}GB file storage'}, {storage: '50'}),
                            formatMessage({id: 'pretrial_pricing_modal.briefing.starter.messageHistory', defaultMessage: 'Limited message history'}),
                            formatMessage({id: 'pretrial_pricing_modal.briefing.starter.boardCards', defaultMessage: '{boards} Boards cards per server'}, {boards: '500'}),
                            formatMessage({id: 'pretrial_pricing_modal.briefing.starter.teamCount', defaultMessage: 'Limited to one team'})],
                    }}
                    buttonDetails={{
                        action: () => {},
                        text: formatMessage({id: 'pretrial_pricing_modal.btn.upgrade', defaultMessage: 'Upgrade'}),
                        disabled: isStarter,
                        customClass: ButtonCustomiserClasses.grayed,
                    }}
                    planDisclaimer={formatMessage({id: 'pretrial_pricing_modal.planDisclaimer.starter', defaultMessage: 'This plan has data restrictions.'})}
                    planLabel={
                        isStarter ? (
                            <PlanLabel
                                text={formatMessage({id: 'pretrial_pricing_modal.planLabel.currentPlan', defaultMessage: 'CURRENT PLAN'})}
                                color='#3DB887'
                                bgColor='#FFFFFF'
                                firstSvg={<CheckMarkSvg/>}
                            />) : undefined}
                />
                <Card
                    topColor='#4A69AC'
                    plan='Professional'
                    price='$10'
                    rate={formatMessage({id: 'pretrial_pricing_modal.rate.userPerMonth', defaultMessage: '/user/month'})}
                    briefing={{
                        title: formatMessage({id: 'pretrial_pricing_modal.briefing.professional', defaultMessage: 'All the features of Starter, plus'}),
                        items: [
                            formatMessage({id: 'pretrial_pricing_modal.briefing.storage', defaultMessage: '{storage}GB file storage'}, {storage: '100'}),
                            'OneLogin / ADFS SAML 2.0',
                            'OpenID connect',
                            'Office365 suite integration',
                            formatMessage({id: 'pretrial_pricing_modal.briefing.professional.readOnlyAnnoucementChannels', defaultMessage: 'Read-only announcement channels'})],
                    }}
                    buttonDetails={{
                        action: () => {},
                        text: formatMessage({id: 'pretrial_pricing_modal.btn.upgrade', defaultMessage: 'Upgrade'}),
                        customClass: ButtonCustomiserClasses.active,
                    }}
                    planLabel={
                        <PlanLabel
                            text={formatMessage({id: 'pretrial_pricing_modal.planLabel.mostPopular', defaultMessage: 'MOST POPULAR'})}
                            bgColor='#1E325C'
                            color='#FFFFFF'
                            firstSvg={<StarMarkSvg/>}
                            secondSvg={<StarMarkSvg/>}
                        />}
                />
                <Card
                    topColor='#1C58D9'
                    plan='Enterprise'
                    price={formatMessage({id: 'pretrial_pricing_modal.price.contactSales', defaultMessage: 'Contact sales'})}
                    briefing={{
                        title: formatMessage({id: 'pretrial_pricing_modal.briefing.enterprise', defaultMessage: 'All the features of Professional, plus'}),
                        items: [
                            'LDAP group sync',
                            formatMessage({id: 'pretrial_pricing_modal.briefing.professional.highAvailability', defaultMessage: 'High Availability'}),
                            formatMessage({id: 'pretrial_pricing_modal.briefing.enterprise.advancedCompliance', defaultMessage: 'Advanced compliance'}),
                            formatMessage({id: 'pretrial_pricing_modal.briefing.professional.advancedRolesAndPermissions', defaultMessage: 'Advanced roles and permissions'})],
                    }}
                    buttonDetails={{
                        action: () => {},
                        text: formatMessage({id: 'pretrial_pricing_modal.btn.tryDays', defaultMessage: 'Try free for {days} days'}, {days: '30'}),
                        customClass: ButtonCustomiserClasses.special,
                    }}
                    extraAction={{
                        action: () => {},
                        text: formatMessage({id: 'pretrial_pricing_modal.btn.contactSales', defaultMessage: 'Contact Sales'}),
                    }}
                />
            </Modal.Body>
        </div>
    );
}

export default Content;
