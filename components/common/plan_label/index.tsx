// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import styled from 'styled-components';

type PlanLabelProps = {
    text: string;
    bgColor: string;
    color: string;
    firstSvg: JSX.Element;
    secondSvg?: JSX.Element;
}

type StyledProps = {
    bgColor?: string;
    color?: string;
}

const StyledPlanLabel = styled.div<StyledProps>`
background-color: ${(props) => props.bgColor};
color: ${(props) => props.color};
`;

function PlanLabel(props: PlanLabelProps) {
    return (
        <StyledPlanLabel
            className='planLabel'
            bgColor={props.bgColor}
            color={props.color}
        >
            {props.firstSvg}
            {props.text}
            {props.secondSvg}
        </StyledPlanLabel>
    );
}

export default PlanLabel;

