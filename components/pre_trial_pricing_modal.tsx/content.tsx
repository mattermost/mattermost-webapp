// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Modal} from 'react-bootstrap';

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
    return (
        <div className='Content'>
            <div className='self-hosted-alert'>
                <h1>{'Looking to self-host?'}</h1>
                <p>{'Review deployment options'}</p>
            </div>
            <Modal.Header className='PreTrialPricingModal__header'>
                <h1 className='title'>
                    {'Select a plan'}
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
                    price='Free'
                    briefing={{
                        title: 'Starter comes with...',
                        items: ['50GB file storage', 'Limited message history', '500 Boards cards per server', 'Limited to one team'],
                    }}
                    buttonDetails={{
                        action: () => {},
                        text: 'Upgrade',
                        customClass: ButtonCustomiserClasses.grayed,
                    }}
                    planDisclaimer='This plan has data restrictions.'
                    planLabel={
                        <PlanLabel
                            text='CURRENT PLAN'
                            color='#3DB887'
                            bgColor='#FFFFFF'
                            firstSvg={<CheckMarkSvg/>}
                        />}
                />
                <Card
                    topColor='#4A69AC'
                    plan='Professional'
                    price='$10'
                    rate='/user/month'
                    briefing={{
                        title: 'All the features of Starter, plus',
                        items: ['100GB file storage', 'OneLogin / ADFS SAML 2.0', 'OpenID connect', 'Office365 suite integration', 'Read-only announcement channels'],
                    }}
                    buttonDetails={{
                        action: () => {},
                        text: 'Upgrade',
                        customClass: ButtonCustomiserClasses.active,
                    }}
                    planLabel={
                        <PlanLabel
                            text='MOST POPULAR'
                            bgColor='#1E325C'
                            color='#FFFFFF'
                            firstSvg={<StarMarkSvg/>}
                            secondSvg={<StarMarkSvg/>}
                        />}
                />
                <Card
                    topColor='#1C58D9'
                    plan='Enterprise'
                    price='Contact sales'
                    briefing={{
                        title: 'All the features of Professional, plus',
                        items: ['LDAP group sync', 'High Availability', 'Advanced compliance', 'Advanced roles and permissions'],
                    }}
                    buttonDetails={{
                        action: () => {},
                        text: 'Try free for 30 days',
                        customClass: ButtonCustomiserClasses.special,
                    }}
                    extraAction={{
                        action: () => {},
                        text: 'Contact Sales',
                    }}
                />
            </Modal.Body>
        </div>
    );
}

export default Content;
