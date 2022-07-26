// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

export enum ButtonCustomiserClasses {
    grayed = 'grayed',
    active = 'active',
    special = 'special',
    secondary = 'secondary',
}

type PlanBriefing = {
    title: string;
    items: string[];
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
    extraBriefing?: PlanBriefing;
    planExtraInformation?: JSX.Element;
    buttonDetails?: ButtonDetails;
    customButtonDetails?: JSX.Element;
    planLabel?: JSX.Element;
    planDisclaimer?: JSX.Element;
}

type StyledProps = {
    bgColor?: string;
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
            {props.planLabel}
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
                    {props.planExtraInformation}
                </div>
                <div>
                    {props.customButtonDetails || (
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
                {props.planDisclaimer}
                <div className='plan_extra_briefing'>
                    <div>
                        <span className='title'>{props.extraBriefing?.title}</span>
                        {props.extraBriefing?.items.map((i) => {
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

export default Card;
