import React from 'react';
import styled from 'styled-components';
import classnames from 'classnames';

import Icon, { IconSize } from 'components/Icon/Icon';
import Text from 'components/Text/Text';
import { rgbFromCSSVar, calculateRelativeSize } from 'utilities/styleUtilities';
import { ANIMATION_SPEEDS } from 'constants/styleConstants';

export type ButtonSize = 'small' | 'medium' | 'large';

export type ButtonType = 'primary' | 'secondary' | 'tertiary';

export type IconPosition = 'leading' | 'trailing';

export interface ButtonProps {
    className?: string;
    label: string;
    type?: ButtonType;
    size?: ButtonSize;
    iconGlyph?: string;
    iconPosition?: IconPosition;
    disabled?: boolean;
    fullWidth?: boolean;
    destructive?: boolean;
    onClick?: () => void;
}

const ButtonBase: React.FC<ButtonProps> = ({
    className,
    label,
    type = 'primary',
    size = 'medium',
    iconGlyph,
    iconPosition = 'leading',
    disabled = false,
    fullWidth = false,
    destructive = false,
    ...props
}) => {
    let iconSize: IconSize = 16;
    if (size === 'small') {
        iconSize = 12;
    } else if (size === 'large') {
        iconSize = 20;
    }
    const leadingIcon =
        iconGlyph && iconPosition === 'leading' ? <Icon className="Button_icon" glyph={iconGlyph} size={iconSize} /> : '';
    const trailingIcon =
        iconGlyph && iconPosition === 'trailing' ? <Icon className="Button_icon" glyph={iconGlyph} size={iconSize} /> : '';
    return (
        <button
            className={classnames(
                'Button',
                `Button__${type}`,
                `Button__${size}`,
                { Button__fullWidth: fullWidth, Button__destructive: destructive },
                className
            )}
            disabled={disabled}
            {...props}
        >
            {leadingIcon}
            <Text className="Button_label" size={size}>{label}</Text>
            {trailingIcon}
        </button>
    );
};

const Button = styled(ButtonBase)`
    --button-background-color: var(--button-bg-rgb);
    --button-text-color: var(--button-color-rgb);
    --button-variation-color: var(--center-channel-color-rgb);

    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: 0 20px;
    height: 40px;
    font-family: 'Open Sans', sans-serif;
    font-size: ${calculateRelativeSize(14, 10, 'rem')};
    font-weight: 600;
    line-height: ${calculateRelativeSize(18, 14)};
    color: ${rgbFromCSSVar('--button-variation-color')};
    text-decoration: none;
    border-radius: 4px;
    border: none;
    outline: none;
    background: ${rgbFromCSSVar('--button-variation-color', 0)};
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    overflow: hidden;
    cursor: pointer;
    vertical-align: top; { // temporary fix for vertical alignment problem with buttons that have a leading icon due to font craziness! }

    // sub elements (icons, label, fill, border)
    .Button_icon {
        color: ${rgbFromCSSVar('--button-variation-color')};
        pointer-events: none;
    }

    .Button_label {
        margin: 0 8px;
        pointer-events: none;
        user-select: none;

        &:first-child {
            margin-left: 0;
        }
        &:last-child {
            margin-right: 0;
        }
    }

    & + .Button {
        margin-left: 8px;
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
        background: rgb(61, 60, 64);
    }
    &::after {
        opacity: 1;
        border: solid 1px transparent;
    }

    // types (primary, secondary, tertiary)
    &.Button__primary {
        color: ${rgbFromCSSVar('--button-text-color')};
        background: ${rgbFromCSSVar('--button-background-color')};

        &:hover,
        &.hover {
            &::before {
                opacity: 0.16;
            }
        }
        &:focus,
        &.focus {
            &::after {
                border-color: rgba(255, 255, 255, 0.32);
                border-width: 2px;
            }
        }
        &:active,
        &.active {
            &::before {
                opacity: 0.32;
            }
        }
        &[disabled],
        &.disabled {
            cursor: not-allowed;

            &,
            &:hover,
            &.hover,
            &:focus,
            &.focus,
            &:active,
            &.active {
                background: ${rgbFromCSSVar('--button-variation-color', 0.08)};

                .Button_icon,
                .Button_label {
                    color: ${rgbFromCSSVar('--button-variation-color', 0.32)};
                }

                &::before,
                &::after {
                    opacity: 0;
                }
            }
        }

        .Button_icon {
            color: ${rgbFromCSSVar('--button-text-color')};
        }
    }

    &.Button__secondary,
    &.Button__tertiary {
        color: ${rgbFromCSSVar('--button-background-color')};
        background: transparent;

        &::before {
            background: ${rgbFromCSSVar('--button-background-color')};
        }
        &::after {
            border-color: ${rgbFromCSSVar('--button-background-color')};
        }

        &:hover,
        &.hover {
            &:before {
                opacity: 0.04;
            }
        }
        &:focus,
        &.focus {
            &:after {
                border-width: 2px;
            }
        }
        &:active,
        &.active {
            &:before {
                opacity: 0.08;
            }
        }
        &[disabled],
        &.disabled {
            cursor: not-allowed;

            &,
            &:hover,
            &.hover,
            &:focus,
            &.focus,
            &:active,
            &.active {
                .Button_icon,
                .Button_label {
                    color: ${rgbFromCSSVar('--button-variation-color', 0.32)};
                }

                &::before {
                    opacity: 0;
                }

                &::after {
                    border-color: ${rgbFromCSSVar('--button-variation-color', 0.32)};
                }
            }
        }

        .Button_icon {
            color: ${rgbFromCSSVar('--button-background-color')};
        }
    }

    &.Button__tertiary {
        &::after {
            border-color: transparent;
        }
        &:focus,
        &.focus {
            &::after {
                border-color: ${rgbFromCSSVar('--button-background-color')};
            }
        }
        &[disabled],
        &.disabled {
            &,
            &:hover,
            &.hover,
            &:focus,
            &.focus,
            &:active,
            &.active {
                &::after {
                    border-color: transparent;
                }
            }
        }
    }

    // variations
    &.Button__destructive:not([disabled]):not(.disabled) {
        &.Button__primary {
            background: ${rgbFromCSSVar('--dnd-indicator-rgb')};
        }
        &.Button__secondary,
        &.Button__tertiary {
            color: ${rgbFromCSSVar('--dnd-indicator-rgb')};

            &::before {
                background: ${rgbFromCSSVar('--dnd-indicator-rgb')};
            }
            &::after {
                border-color: ${rgbFromCSSVar('--dnd-indicator-rgb')};
            }
        }
        &.Button__tertiary {
            &::after {
                border-color: transparent;
            }
            &:focus,
            &.focus {
                &::after {
                    border-color: ${rgbFromCSSVar('--dnd-indicator-rgb')};
                }
            }
        }
    }

    // sizes (small, large, full width)
    &.Button__small {
        padding: 0 16px;
        height: 32px;
        font-size: ${calculateRelativeSize(12, 10, 'rem')};
        line-height: ${calculateRelativeSize(16, 12)};
    }
    &.Button__large {
        padding: 0 24px;
        height: 48px;
        font-size: ${calculateRelativeSize(16, 10, 'rem')};
        line-height: ${calculateRelativeSize(20, 16)};
    }
    &.Button__fullWidth {
        min-width: 100%;
        margin: 0;

        .Button_icon {
            flex-shrink: 1;
        }
        .Button_label {
            flex-grow: 1;
        }

        & + .Button {
            margin-left: 0px;
            margin-top: 8px;
        }
    }

    // animation
    .enable-animations & {
        transition: background-color ${ANIMATION_SPEEDS.SHORTER} 0s ease-in-out;

        .Button_label {
            transition: color ${ANIMATION_SPEEDS.SHORTER} 0s ease-in-out;
        }

        &::before {
            transition: opacity ${ANIMATION_SPEEDS.SHORTER} 0s ease-in-out;
        }
        &::after {
            transition: border-color ${ANIMATION_SPEEDS.SHORTER} 0s ease-in-out,
                border-width ${ANIMATION_SPEEDS.SHORTER} 0s ease-in-out,
                opacity ${ANIMATION_SPEEDS.SHORTER} 0s ease-in-out;
        }
    }
`;

export default Button;
