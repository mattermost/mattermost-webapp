// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import styled, {css} from 'styled-components';
import StatusIcon from '@mattermost/compass-components/components/status-icon';

const Animation = styled.div`
    position: absolute;
    z-index: 30;
    display:flex;
    flex-direction:column;
    left: 4%;
    top: 0;
    &:before {
        content: '';
        background-color: var(--denim-status-online);
        opacity: 1;
        border-radius: 50%;
        width: 1rem;
        height:1rem;
    }
    .x1 {
        animation: moveUp 900ms linear, opacity 900ms ease-in-out;
    }

    .x2 {
        transform: scale(0.6);
        margin-left: 6px;
        animation: moveUp 900ms linear, opacity 900ms ease-in-out;
        animation-delay: 200ms;
    }
    .x3 {
        transform: scale(0.6);
        margin-left: -6px;
        animation: moveUp 900ms linear, opacity 900ms ease-in-out;
        animation-delay: 100ms;
    }
    .x4 {
        transform: scale(0.2);
        animation: moveUp 900ms linear, opacity 900ms ease-in-out;
        animation-delay: 250ms;
    }

    @keyframes moveUp { 
        0% { 
            top: 50px;
        }
        100% { 
            top: -50px;
        }
    }

    @keyframes opacity {
        0% { 
            opacity:0;
        }
        50% { 
            opacity: 1;
        }
        100% { 
            opacity: 0;
        }
    }
`;

export const CompletedAnimation = () => {
    return (
        <Animation>
            <StatusIcon
                status={'online'}
                className={'x1'}
            />
            <StatusIcon 
                status={'online'}
                className={'x2'}
            />                          
            <StatusIcon
                status={'online'}
                className={'x3'}
            />                           
            <StatusIcon
                status={'online'}
                className={'x4'}
            />
        </Animation>
    )
}
