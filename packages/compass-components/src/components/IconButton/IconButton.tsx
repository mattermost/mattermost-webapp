import React from 'react';
import styled from 'styled-components';
import classnames from 'classnames';

import { rgbFromCSSVar } from 'utilities/styleUtilities';
import Icon, { IconSize } from 'components/Icon/Icon';
import Text, { TextSize } from 'components/Text/Text';
import { ANIMATION_SPEEDS } from 'constants/styleConstants';

export type IconButtonSize = 'xsmall' | 'small-compact' | 'small' | 'medium' | 'large';

export interface IconButtonProps {
    className?: string;
    ariaLabel?: string;
    size?: IconButtonSize;
    iconGlyph: string;
    disabled?: boolean;
    destructive?: boolean;
    label?: string;
    onClick?: () => void;
}

const IconButtonBase: React.FC<IconButtonProps> = ({
    className,
    ariaLabel,
    size = 'medium',
    iconGlyph,
    disabled = false,
    destructive = false,
    label,
    ...props
}) => {
    let textSize: TextSize = "medium"; // medium, default
    let iconSize: IconSize = 20; // medium, default
    switch (size) {
        case 'xsmall': {
            textSize = "small";
            iconSize = 12;
            break;
        }
        case 'small-compact':
        case 'small': {
            textSize = "small";
            iconSize = 16;
            break;
        }
        case 'large': {
            textSize = "large";
            iconSize = 28;
            break;
        }
    }
    const buttonLabel = label ? <Text className="IconButton_label" size={textSize} bold={true} animate={true}>{label}</Text> : null;
    return (
        <button
            className={classnames('IconButton', `IconButton__${size}`, { IconButton__destructive: destructive }, className)}
            aria-label={ariaLabel}
            disabled={disabled}
            {...props}
        >
            <Icon className="IconButton_icon" glyph={iconGlyph} size={iconSize} />
            {buttonLabel}
        </button>
    );
};

const IconButton = styled(IconButtonBase)`
    --button-background-color: var(${(props) => (props.destructive ? '--dnd-indicator-rgb' : '--button-bg-rgb')});
    --button-text-color: var(--button-color-rgb);
    --button-variation-color: var(--center-channel-color-rgb);

    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: 0 10px;
    min-width: 40px;
    height: 40px;
    border-radius: 4px;
    border: none;
    outline: none;
    background: transparent;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    overflow: hidden;
    cursor: pointer;

    // sub elements
    .IconButton_icon,
    .IconButton_label {
        color: ${rgbFromCSSVar('--center-channel-color-rgb', 0.56)};
    }
    .IconButton_icon + .IconButton_label {
        margin-left: 6px;
    }

    // - (::before for fill, ::after for border)
    &::before,
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        border-radius: 4px;
        border: none;
        background: transparent;
        z-index: 0;
        pointer-events: none;
    }
    &::before {
        opacity: 0;
        background: ${rgbFromCSSVar('--center-channel-color-rgb', 0.08)};
    }
    &::after {
        opacity: 0;
        border: solid 2px ${rgbFromCSSVar('--button-bg-rgb')};
    }

    // states
    &:hover,
    &.hover {
        .IconButton_icon,
        .IconButton_label {
            color: ${rgbFromCSSVar('--center-channel-color-rgb', 0.72)};
        }
        &::before {
            opacity: 1;
        }
    }
    &:focus,
    &.focus {
        &::after {
            opacity: 1;
        }
    }
    &:active,
    &.active {
        .IconButton_icon,
        .IconButton_label {
            color: ${rgbFromCSSVar('--button-bg-rgb')};
        }
        &::before {
            background: ${rgbFromCSSVar('--button-bg-rgb', 0.08)};
            opacity: 1;
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
            .IconButton_icon,
            .IconButton_label {
                color: ${rgbFromCSSVar('--center-channel-color-rgb', 0.32)};
            }

            &::before,
            &::after {
                opacity: 0;
            }
        }
    }

    // variations
    &.IconButton__destructive:not([disabled]):not(.disabled) {
        .IconButton_icon,
        .IconButton_label {
            color: ${rgbFromCSSVar('--dnd-indicator-rgb')};
        }

        &::after {
            border: solid 2px ${rgbFromCSSVar('--dnd-indicator-rgb')};
        }

        &:active,
        &.active {
            &::before {
                background: ${rgbFromCSSVar('--dnd-indicator-rgb', 0.08)};
            }
        }
    }

    // sizes (xsmall, small, small-compact, medium, large)
    &.IconButton__xsmall {
        padding: 0 6px;
        min-width: 24px;
        height: 24px;

        .IconButton_icon + .IconButton_label {
            margin-left: 4px;
        }
    }
    &.IconButton__small {
        padding: 0 8px;
        min-width: 32px;
        height: 32px;

        .IconButton_icon + .IconButton_label {
            margin-left: 4px;
        }
    }
    &.IconButton__small-compact {
        padding: 0 6px;
        min-width: 28px;
        height: 28px;

        .IconButton_icon + .IconButton_label {
            margin-left: 4px;
        }
    }
    &.IconButton__medium {
        // medium is the default, including for consistency
    }
    &.IconButton__large {
        padding: 0 10px;
        min-width: 48px;
        height: 48px;

        .IconButton_icon + .IconButton_label {
            margin-left: 6px;
        }
    }

    // animation
    .enable-animations & {
        &::before {
            transition: opacity ${ANIMATION_SPEEDS.SHORTER} 0s ease-in-out,
                background-color ${ANIMATION_SPEEDS.SHORTER} 0s ease-in-out;
        }
        &::after {
            transition: opacity ${ANIMATION_SPEEDS.SHORTER} 0s ease-in-out;
        }
    }
`;

export default IconButton;
