import React from 'react';
import styled from 'styled-components';
import classnames from 'classnames';

import { rgbWithCSSVar } from '../../utilities/styleUtilities';
import Icon, { IconSize } from '../Icon/Icon';
import Text, { TextSize } from '../Text/Text';
import { ANIMATION_SPEEDS } from '../../constants/styleConstants';

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

const IconButtonBase: React.FC<IconButtonProps & React.ComponentPropsWithoutRef<"button">> = ({
    className,
    label,
    ariaLabel,
    size = 'medium',
    iconGlyph,
    disabled = false,
    destructive = false,
    onClick,
    ...props
}) => {
    let textSize: TextSize = 16; // medium, default
    let iconSize: IconSize = 20; // medium, default
    switch (size) {
        case 'xsmall': {
            textSize = 12;
            iconSize = 12;
            break;
        }
        case 'small-compact':
        case 'small': {
            textSize = 14;
            iconSize = 16;
            break;
        }
        case 'large': {
            textSize = 18;
            iconSize = 28;
            break;
        }
    }
    const buttonLabel = label ? <Text className="IconButton_label" size={textSize} bold={true}>{label}</Text> : null;
    return (
        <button
            className={classnames('IconButton', `IconButton__${size}`, { IconButton__destructive: destructive }, className)}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            <Icon className="IconButton_icon" glyph={iconGlyph} size={iconSize} />
            {buttonLabel}
        </button>
    );
};

function generateSizeStyles(sizeLabel: IconButtonSize, size: number, padding: number, spacing: number): string {
    return `
        &.IconButton__${sizeLabel} {
            padding: 0 ${padding}px;
            min-width: ${size}px;
            height: ${size}px;

            .IconButton_icon + .IconButton_label {
                margin-left: ${spacing}px;
            }
        }
    `
}

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
        color: ${rgbWithCSSVar('--center-channel-color-rgb', 0.56)};
    }
    .IconButton_icon + .IconButton_label {
        margin-left: 6px;
    }

    // - ::before for fill, ::after for border
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
        background: ${rgbWithCSSVar('--center-channel-color-rgb', 0.08)};
    }
    &::after {
        opacity: 0;
        border: solid 2px ${rgbWithCSSVar('--button-bg-rgb')};
    }

    // states
    &:hover {
        .IconButton_icon,
        .IconButton_label {
            color: ${rgbWithCSSVar('--center-channel-color-rgb', 0.72)};
        }
        &::before {
            opacity: 1;
        }
    }
    &:focus {
        &::after {
            opacity: 1;
        }
    }
    &:focus:not(:focus-visible) {
        &::after {
            opacity: 0;
        }
    }
    &:focus-visible {
        &::after {
            opacity: 1;
        }
    }
    &:active {
        .IconButton_icon,
        .IconButton_label {
            color: ${rgbWithCSSVar('--button-bg-rgb')};
        }
        &::before {
            background: ${rgbWithCSSVar('--button-bg-rgb', 0.08)};
            opacity: 1;
        }
    }

    // variations
    &.IconButton__destructive:not([disabled]):not(.disabled) {
        .IconButton_icon,
        .IconButton_label {
            color: ${rgbWithCSSVar('--dnd-indicator-rgb')};
        }

        &::after {
            border: solid 2px ${rgbWithCSSVar('--dnd-indicator-rgb')};
        }

        &:active {
            &::before {
                background: ${rgbWithCSSVar('--dnd-indicator-rgb', 0.08)};
            }
        }
    }
    &[disabled],
    .disabled {
        cursor: not-allowed;

        &,
        &:hover,
        &:focus,
        &:focus-visible,
        &:active {
            .IconButton_icon,
            .IconButton_label {
                color: ${rgbWithCSSVar('--center-channel-color-rgb', 0.32)};
            }

            &::before,
            &::after {
                opacity: 0;
            }
        }
    }

    // sizes (xsmall, small, small-compact, medium, large)
    ${generateSizeStyles('xsmall', 24, 6, 4)}

    ${generateSizeStyles('small', 32, 8, 4)}

    ${generateSizeStyles('small-compact', 28, 6, 4)}

    ${generateSizeStyles('medium', 40, 10, 6)}

    ${generateSizeStyles('large', 48, 10, 6)}

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
