// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ForwardedRef} from 'react';
import styled, {css} from 'styled-components';
import classNames from 'classnames';

import {MenuItemProps} from './Menu.types';

const MenuItemLabel = styled.span`
    font-size: 14px;
    line-height: 20px;
    margin: 0 8px 0 0;
`;

const MenuItemDescription = styled.span`
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: rgba(var(--center-channel-color-rgb), 0.56);
`;

const LabelWrapper = styled.div<{leadingElement: boolean}>(
    ({leadingElement}) => css`
        display: flex;
        flex-direction: column;
        padding-left: ${leadingElement ? '10px' : 0};
    `,
);

const MenuItemRoot = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    background-color: rgb(255, 255, 255);
    cursor: pointer;
    width: 100%;
    flex-basis: 100%;
    padding: 8px 16px;
    color: var(--center-channel-color);

    &.destructive {
        color: var(--dnd-indicator);
        &:hover {
            background-color: rgba(var(--dnd-indicator-rgb), 0.87);
            color: white;
        }
        &:active {
            background-color: var(--dnd-indicator);
            color: white;
        }
    }

    &.disabled {
        cursor: not-allowed;
        > * {
            color: rgba(var(--center-channel-color-rgb), 0.72);
            opacity: 0.32;
        }
    }
    :hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
    }
    :active {
        background-color: rgba(var(--button-bg-rgb), 0.08);
    }
    :focus {
        box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.32),
            inset 0 0 0 2px blue;
    }
    :focus:not(:focus-visible) {
        box-shadow: none;
    }
    :focus-visible {
        outline: none;
    }

    transition: background 250ms ease-in-out, color 250ms ease-in-out,
        box-shadow 250ms ease-in-out;
`;

const MenuItem = React.forwardRef(
    (props: MenuItemProps, reference: ForwardedRef<null>): JSX.Element => {
        const {
            label,
            description,
            destructive = false,
            disabled = false,
            leadingElement,
            trailingElementLabel,
            trailingElement,
            onClick,
            onHover,
        } = props;

        const rootProperties = {
            onMouseEnter: onHover,
            onClick,
            destructive,
            disabled,
        };

        return (
            <MenuItemRoot
                ref={reference}
                className={classNames({disabled, destructive})}
                {...rootProperties}
            >
                {leadingElement}
                <LabelWrapper leadingElement={Boolean(leadingElement)}>
                    <MenuItemLabel>{label}</MenuItemLabel>
                    {description && (
                        <MenuItemDescription>{description}</MenuItemDescription>
                    )}
                </LabelWrapper>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyItems: 'flex-start',
                    }}
                >
                    {trailingElement && trailingElementLabel && (
                        <MenuItemDescription>
                            {trailingElementLabel}
                        </MenuItemDescription>
                    )}
                    {trailingElement}
                </div>
            </MenuItemRoot>
        );
    },
);
export default MenuItem;
