import React from 'react';
import styled from 'styled-components';
import classnames from 'classnames';

import Icon, { IconSize } from 'components/Icon/Icon';

export type IconButtonSize = 'xsmall' | 'small' | 'small-compact' | 'medium' | 'large';

export interface IconButtonProps {
    className?: string;
    ariaLabel?: string;
    size?: IconButtonSize;
    iconGlyph: string;
    disabled?: boolean;
    destructive?: boolean;
    onClick?: () => void;
}

const IconButtonBase: React.FC<IconButtonProps> = ({
    className,
    ariaLabel,
    size = 'medium',
    iconGlyph,
    disabled = false,
    destructive = false,
    ...props
}) => {
    let iconSize: IconSize = 20;
    switch (size) {
        case 'xsmall': {
            iconSize = 12;
            break;
        }
        case 'small':
        case 'small-compact': {
            iconSize = 16;
            break;
        }
        case 'large': {
            iconSize = 28;
            break;
        }
    }
    return (
        <button
            className={classnames('IconButton', 'IconButton___standard')}
            aria-label={ariaLabel}
            {...props}
        >
            <Icon className="IconButton_icon" glyph={iconGlyph} size={iconSize} />
        </button>
    );
};

const IconButton = styled(IconButtonBase)`
    --button-background-color: var(${props => props.destructive ? '--dnd-indicator-rgb': '--button-bg-rgb'});
    --button-text-color: var(--button-color-rgb);
    --button-variation-color: var(--center-channel-color-rgb);

    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: 10px;
    width: 40px;
    height: 40px;
    font-size: 14/10*1rem;
    line-height: 1;
    color: color(--center-channel-color-rgb, 0.56);
    border-radius: 4px;
    border: none;
    outline: none;
    background: color(--center-channel-color-rgb, 0);
    -webkit-tap-highlight-color: rgba(0,0,0,0);
    overflow: hidden;
    cursor: pointer;

    // elements
    .IconButton_icon {
        color: color(--center-channel-color-rgb, 0.56);
    }

    // states
    // - ::before used for inside border
    &::before{
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        border-radius: 4px;
        border: solid 2px transparent;
        z-index: 0;
    }

    &:hover,
    &.hover {
        background: color(--center-channel-color-rgb, 0.08);

        .IconButton_icon {
            color: color(--center-channel-color-rgb, 0.72);
        }
    }
    &:focus,
    &.focus {
        &::before {
            border-color: color(--button-bg-rgb);
        }
    }
    &:active,
    &.active {
        background: color(--button-bg-rgb, 0.08);

        .IconButton_icon {
            color: color(--button-bg-rgb);
        }
    }
    &[disabled],
    .disabled {
        cursor: not-allowed;

        &,
        &:hover,
        &.hover,
        &:focus,
        &.focus,
        &:active,
        &.active {
            background: transparent;

            .IconButton_icon {
                color: color(--center-channel-color-rgb, 0.32);
            }

            &::before {
                border-color: transparent;
            }
        }
    }

    // sizes (compact, small, large)
    &___compact {
        padding: 6px;
        width: 28px;
        height: 28px;
    }
    &___small {
        padding: 8px;
        width: 32px;
        height: 32px;
    }
    &___large {
        padding: 10px;
        width: 48px;
        height: 48px;

        // the large IconButton uses a non-standard icon size
        .IconButton_icon {
            padding: 4px;
            width: 28px;
            height: 28px;

            &::before {
                font-size: 24/10*1rem;
            }
        }
    }

    // animation
    .enable-animations & {
        transition: background-color $animation-speed-shorter 0s ease-in-out;

        &::before {
            transition: border-color $animation-speed-shorter 0s ease-in-out;
        }
    }
`;

export default IconButton;
