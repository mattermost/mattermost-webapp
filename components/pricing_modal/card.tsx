// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import BuildingSvg from './building.svg';
import TadaSvg from './tada.svg';

export enum ButtonCustomiserClasses {
    grayed = 'grayed',
    active = 'active',
    special = 'special',
    secondary = 'secondary',
}

type PlanBriefing = {
    title: string;
    items?: string[];
}

type PlanAddonsInfo = {
    title: string;
    items: PlanBriefing[];
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
    planLabel?: JSX.Element;
    plan: string;
    planSummary?: string;
    price?: string;
    rate?: string;
    planExtraInformation?: JSX.Element;
    buttonDetails?: ButtonDetails;
    customButtonDetails?: JSX.Element;
    contactSalesCTA?: JSX.Element;
    briefing: PlanBriefing;
    planAddonsInfo?: PlanAddonsInfo;
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
                    <h3>{props.plan}</h3>
                    <p>{props.planSummary}</p>
                    {props.price ? <h1>{props.price}</h1> : <BuildingSvg/>}
                    <p>{props.rate}</p>
                </div>

                <div className='plan_limits_cta'>
                    {props.planExtraInformation}
                </div>

                <div className='plan_buttons'>
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

                <div className='contact_sales_cta'>
                    {props.contactSalesCTA && (
                        <div>
                            <p>{'or'}</p>
                            {props.contactSalesCTA}
                        </div>)}
                </div>

                <div className='plan_briefing'>
                    <hr/>
                    <div>
                        <span className='title'>{props.briefing.title}</span>
                        {props.briefing.items?.map((i) => {
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

                {props.planAddonsInfo && (
                    <div className='plan_add_ons'>
                        <div className='illustration'><TadaSvg/></div>
                        <h4 className='title'>{props.planAddonsInfo.title}</h4>
                        {props.planAddonsInfo.items.map((i, ind) => {
                            return (
                                <div
                                    className='item'
                                    key={ind}
                                >
                                    <div className='item_title'><i className='fa fa-circle bullet fa-xs'/><p>{i.title}</p></div>
                                    {i.items?.map((sub) => {
                                        return (
                                            <div
                                                className='subitem'
                                                key={sub}
                                            >
                                                <div className='subitem_title'><i className='fa fa-circle bullet fa-xs'/><p>{sub}</p></div>
                                            </div>

                                        );
                                    })}
                                </div>
                            );
                        })}

                    </div>
                )}

            </div>
        </div>
    );
}

export default Card;
