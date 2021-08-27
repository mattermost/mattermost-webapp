// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import BackgroundPillSymbol from 'components/widgets/background_pill_symbol';

const BackgroundSvgContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, rgba(var(--center-channel-color-rgb), 0.08) 35%, rgba(var(--center-channel-bg-rgb), 1) 100%);
    overflow: hidden;

    > svg {
        position: relative;
        width: calc(1950 / 1470 * 100%);
        max-width: 3400px;
        min-width: 1950px;
    }
`;

const pillID = 'onboardingBackgroundPill';

const BackgroundSvg = (): JSX.Element => (
    <BackgroundSvgContainer>
        <svg
            viewBox='0 0 1950 1470'
            preserveAspectRatio='xMinYMin meet'
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            xmlnsXlink='http://www.w3.org/1999/xlink'
        >
            <g style={{transform: 'translate(940px, -550px) rotate(45deg)'}}>
                <use
                    xlinkHref={`#${pillID}`}
                    width='1260'
                    height='749'
                    style={{transform: 'translate(0, -56px)'}}
                />
            </g>
            <g style={{transform: 'translate(960px, 1330px) rotate(-135deg)'}}>
                <use
                    xlinkHref={`#${pillID}`}
                    width='1260'
                    height='749'
                    style={{transform: 'translate(0, -56px)'}}
                />
            </g>
            <g style={{transform: 'translate(1500px, 1470px) rotate(-135deg)'}}>
                <use
                    xlinkHref={`#${pillID}`}
                    width='1260'
                    height='749'
                    style={{transform: 'translate(0, -56px)'}}
                />
            </g>
            <g style={{transform: 'translate(-80px, 60px) rotate(45deg)'}}>
                <use
                    xlinkHref={`#${pillID}`}
                    width='1260'
                    height='749'
                    style={{transform: 'translate(0, -56px)'}}
                />
            </g>
            <BackgroundPillSymbol id={pillID}/>
        </svg>
    </BackgroundSvgContainer>
);

export default BackgroundSvg;
