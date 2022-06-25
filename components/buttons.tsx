// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import styled from 'styled-components';

export const Button = styled.button`
    display: inline-flex;
    align-items: center;
    height: 40px;
    background: rgba(var(--center-channel-color-rgb), 0.08);
    color: rgba(var(--center-channel-color-rgb), 0.72);
    border-radius: 4px;
    border: 0px;
    font-weight: 600;
    font-size: 14px;
    align-items: center;
    padding: 0 20px;
    position: relative;

    &:hover{
        background: rgba(var(--center-channel-color-rgb), 0.12);
    }

    &:disabled {
        color: rgba(var(--center-channel-color-rgb), 0.32);
        background: rgba(var(--center-channel-color-rgb), 0.08);
    }

    i {
        display: flex;
        font-size: 18px;
    }
`;

export const PrimaryButton = styled(Button)`
    background: var(--button-bg);
    color: var(--button-color);
    transition: background 0.15s ease-out;
    white-space: nowrap;

    &:active:not([disabled])  {
        background: rgba(var(--button-bg-rgb), 0.8);
    }

    &:before {
        content: '';
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        transition: all 0.15s ease-out;
        position: absolute;
        background: rgba(var(--center-channel-color-rgb), 0.16);
        opacity: 0;
        border-radius: 4px;
    }

    &:hover:enabled {
        background: var(--button-bg);
        &:before {
            opacity: 1;
        }
    }
`;

export const SubtlePrimaryButton = styled(Button)`
    background: rgba(var(--button-bg-rgb), 0.08);
    color: var(--button-bg);
    &:hover,
    &:active {
        background: rgba(var(--button-bg-rgb), 0.12);
    }
`;

export const TertiaryButton = styled.button`
    display: inline-flex;
    align-items: center;
    height: 40px;
    border-radius: 4px;
    border: 0px;
    font-weight: 600;
    font-size: 14px;
    padding: 0 20px;
    transition: all 0.15s ease-out;

    color: var(--button-bg);
    background: rgba(var(--button-bg-rgb), 0.08);

    &:disabled {
        color: rgba(var(--center-channel-color-rgb), 0.32);
        background: rgba(var(--center-channel-color-rgb), 0.08);
    }

    &:hover:enabled {
        background: rgba(var(--button-bg-rgb), 0.12);
    }

    &:active:enabled  {
        background: rgba(var(--button-bg-rgb), 0.16);
    }

    i {
        display: flex;
        font-size: 18px;

        &:before {
            margin: 0 7px 0 0;
        }
    }
`;

export const GrayTertiaryButton = styled.button`
    border: none;
    background: none;
    font-size: 12px;
    font-weight: normal;
    line-height: 16px;
    color: rgba(var(--center-channel-color-rgb), 0.64);
    text-align: left;

    &:hover {
        color: rgba(var(--center-channel-color-rgb));
    }
`;

export const SecondaryButton = styled(TertiaryButton)`
    background: var(--button-color-rgb);
    border: 1px solid var(--button-bg);


    &:disabled {
        color: rgba(var(--center-channel-color-rgb), 0.32);
        background: transparent;
        border: 1px solid rgba(var(--center-channel-color-rgb), 0.32);
    }
`;

export const DestructiveButton = styled.button`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    font-weight: 600;
    font-size: 14px;

    padding: 0 20px;

    border-radius: 4px;
    border: 0px;

    background: var(--dnd-indicator);
    color: var(--button-color);

    :hover:enabled {
        background: linear-gradient(0deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08)), var(--dnd-indicator);
    }

    :active, :hover:active {
        background: linear-gradient(0deg, rgba(0, 0, 0, 0.16), rgba(0, 0, 0, 0.16)), var(--dnd-indicator);
    }

    :disabled {
        background: rgba(var(--center-channel-color-rgb), 0.08);
    }
`;

export const ButtonIcon = styled.button`
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    background: transparent;
    border-radius: 4px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
    fill: rgba(var(--center-channel-color-rgb), 0.56);
    font-size: 1.6rem;

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
        color: rgba(var(--center-channel-color-rgb), 0.72);
        fill: rgba(var(--center-channel-color-rgb), 0.72);
    }

    &:active,
    &--active,
    &--active:hover {
        background: rgba(var(--button-bg-rgb), 0.08);
        color: var(--button-bg);
        fill: var(--button-bg);
    }

    display: flex;
    align-items: center;
    justify-content: center;
`;
