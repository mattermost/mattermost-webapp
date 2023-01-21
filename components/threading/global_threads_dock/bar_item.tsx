// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import styled from 'styled-components';

export const BarItem = styled.header`
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    border: none;
    height: 28px;
    padding: 4px 8px;
    border-radius: 4px;
    background: rgba(var(--center-channel-color-rgb), 0.12);
    box-shadow: none;
    color: rgba(var(--global-header-text-rgb), 0.64) !important;
    font-size: 13px;
    line-height: 16px;
    outline: none;
    white-space: nowrap;
    cursor: pointer;

    &:hover,
    &:focus {
        background: rgba(var(--sidebar-text-rgb), 0.16);
        color: rgba(var(--global-header-text-rgb), 0.64);
    }

    button {
        &:hover,
        &:focus {
            color: rgba(var(--global-header-text-rgb), 1);
        }
    }
`;
