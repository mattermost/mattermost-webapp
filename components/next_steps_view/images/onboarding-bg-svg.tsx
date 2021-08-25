// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import BackgroundPillSymbol from 'components/widgets/background_pill_symbol';

const OnboardingBgSvgContainer = styled.div`
    position: relative;
    background: rgba(var(--center-channel-color-rgb), 0.08);
    overflow: hidden;

    > svg {
        max-width: 3350px;
        min-width: 1675px;
        width: 158%;
    }
`;

const pillID = 'onboardingBackgroundPill';

const OnboardingBgSvg = (): JSX.Element => (
    <OnboardingBgSvgContainer>
        <svg
            preserveAspectRatio='xMinYMin meet'
            width='3350'
            height='2287'
            viewBox='0 0 3350 2287'
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            xmlnsXlink='http://www.w3.org/1999/xlink'
        >
            <g style={{transformOrigin: 'top left', transform: 'translate(730px, 2346px) rotate(-135deg)'}}>
                <use xlinkHref={`#${pillID}`}/>
            </g>
            <g style={{transformOrigin: 'top left', transform: 'translate(1302px, -134px) rotate(45deg)'}}>
                <use xlinkHref={`#${pillID}`}/>
            </g>
            <g style={{transformOrigin: 'top left', transform: 'translate(2646px, 1556px) rotate(-135deg)'}}>
                <use xlinkHref={`#${pillID}`}/>
            </g>
            <g style={{transformOrigin: 'top left', transform: 'translate(184px, -772px) rotate(45deg)'}}>
                <use xlinkHref={`#${pillID}`}/>
            </g>
            <BackgroundPillSymbol id={pillID}/>
        </svg>
    </OnboardingBgSvgContainer>
);

export default OnboardingBgSvg;
