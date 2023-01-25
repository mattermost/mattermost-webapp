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
    background: rgb(var(--global-header-text-rgb), 0.08);
    box-shadow: none;
    color: rgba(var(--global-header-text-rgb), 0.64) !important;
    font-size: 13px;
    line-height: 16px;
    outline: none;
    white-space: nowrap;
    cursor: pointer;
    position: relative;

    &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgb(var(--global-header-bg-rgb));
        z-index: -1;
    }


    &:hover,
    &:focus {
        background: rgb(var(--global-header-text-rgb), 0.12);
        > span {
            color: rgba(var(--global-header-text-rgb), 1) !important;
        }
    }

    button {
        &:hover,
        &:focus {
            color: rgba(var(--global-header-text-rgb), 1);
        }
    }
`;
