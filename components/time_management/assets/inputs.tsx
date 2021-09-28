// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import styled from 'styled-components';

export const BaseInput = styled.input`
    transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;
    background-color: rgb(var(--center-channel-bg-rgb));
    border: none;
    box-shadow: inset 0 0 0 1px rgba(var(--center-channel-color-rgb), 0.16);
    border-radius: 4px;
    margin-right: 20px;
    height: 40px;
    line-height: 40px;
    padding: 0 16px;
    font-size: 14px;
    &:focus {
        box-shadow: inset 0 0 0 2px var(--button-bg);
    }
`;

interface InputTrashIconProps {
    show: boolean;
}

export const InputTrashIcon = styled.span<InputTrashIconProps>`
    visibility: ${(props) => (props.show ? 'visible' : 'hidden')};
    cursor: pointer;
    position: absolute;
    top: 0px;
    right: 5px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
    &:hover {
        color: var(--center-channel-color);
    }
`;
