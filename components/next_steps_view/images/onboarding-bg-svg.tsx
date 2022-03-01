// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import BackgroundPillSymbol from 'components/widgets/background_pill_symbol';

const OnboardingBgSvgContainer = styled.div`
    position: relative;
    background: rgba(var(--center-channel-color-rgb), 0.08);
    width: 100%;
    height: 100%;
    overflow: hidden;

    > svg {
        position: relative;
        width: calc(1700 / 1366 * 100%);
        max-width: 3400px;
        min-width: 1700px;
    }
`;

const pillID = 'onboardingBackgroundPill';

const OnboardingBgSvg = (): JSX.Element => (
    <OnboardingBgSvgContainer>
        <svg
            viewBox='0 0 1700 1178'
            preserveAspectRatio='xMinYMin meet'
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            xmlnsXlink='http://www.w3.org/1999/xlink'
        >
            <g style={{transform: 'translate(620px, -40px) rotate(45deg)'}}>
                <use
                    xlinkHref={`#${pillID}`}
                    width='900'
                    height='535'
                    style={{transform: 'translate(0, -40px)'}}
                />
            </g>
            <g style={{transform: 'translate(400px, 1150px) rotate(-135deg)'}}>
                <use
                    xlinkHref={`#${pillID}`}
                    width='900'
                    height='535'
                    style={{transform: 'translate(0, -40px)'}}
                />
            </g>
            <g style={{transform: 'translate(1350px, 750px) rotate(-135deg)'}}>
                <use
                    xlinkHref={`#${pillID}`}
                    width='900'
                    height='535'
                    style={{transform: 'translate(0, -40px)'}}
                />
            </g>
            <g style={{transform: 'translate(65px, -350px) rotate(45deg)'}}>
                <use
                    xlinkHref={`#${pillID}`}
                    width='900'
                    height='535'
                    style={{transform: 'translate(0, -40px)'}}
                />
            </g>
            <BackgroundPillSymbol id={pillID}/>
        </svg>
    </OnboardingBgSvgContainer>
);

export default OnboardingBgSvg;
