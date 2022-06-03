// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {memo} from 'react';
import styled, {css} from 'styled-components';

/** eslint-disable no-confusing-arrow */

type TexteditorActionsProps = {
    placement: 'top' | 'bottom';
    show?: boolean;
}

const TexteditorActions = styled.span<TexteditorActionsProps>`
    position: absolute;
    z-index: 2;
    display: flex;
    place-items: center;
    gap: 4px;

    /* define the position based on the placement prop */
    ${({placement}) => (placement === 'top' ? css`
        top: 7px;
        right: 7px;
    ` : css`
        right: 7px;
        bottom: 7px;
    `)}

    opacity: ${({show = true}) => (show ? 1 : 0)};
    transition: opacity 0.3s linear;
    visibility: ${({show = true}) => (show ? 'visible' : 'hidden')};

    .btn-file__disabled {
        opacity: 0.1;

        &:hover,
        &:active {
            opacity: 0.1;
        }
    }
`;

export default memo(TexteditorActions);
