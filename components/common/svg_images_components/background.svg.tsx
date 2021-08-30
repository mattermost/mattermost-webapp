// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

import BackgroundPillSymbol from 'components/widgets/background_pill_symbol';

const BackgroundSvgContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: rgba(var(--center-channel-color-rgb), 0.08);
    z-index: 0;

    ::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 1470px;
        background: linear-gradient(180deg, var(--center-channel-bg) 230px, transparent 460px);
        z-index: 2;
    }

    > svg {
        position: relative;
        width: 1950px;
        z-index: 1;
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
