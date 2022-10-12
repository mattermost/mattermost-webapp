// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {forwardRef, memo} from 'react';
import type {ForwardedRef} from 'react';
import {MessageDescriptor, useIntl} from 'react-intl';
import styled from 'styled-components';
import classNames from 'classnames';
import IconProps from '@mattermost/compass-icons/components/props';

import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';
import KeyboardShortcutSequence from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';
import type {KeyboardShortcutDescriptor} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';

import Constants from 'utils/constants';

export type ToolDefinition<S extends string, T> = {
    mode: S;
    type: T;
    icon: React.FC<IconProps>;
    action: () => void;
    isActive?: () => boolean;
    show?: boolean;
    labelDescriptor?: MessageDescriptor;
    ariaLabelDescriptor?: MessageDescriptor;
    shortcutDescriptor?: KeyboardShortcutDescriptor;
};

export const FloatingContainer = styled.div`
    padding: 8px 0;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    border: 1px solid rgba(var(--center-channel-color-rgb), 0.16);
    background: var(--center-channel-bg);
    z-index: -1;

    transition: transform 250ms ease, opacity 250ms ease;
    transform: scale(0);
    opacity: 0;
    display: flex;
    flex-direction: column;

    &.scale-enter {
        transform: scale(0);
        opacity: 0;
        z-index: 20;
    }

    &.scale-enter-active {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-enter-done {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-exit {
        transform: scale(1);
        opacity: 1;
        z-index: 20;
    }

    &.scale-exit-active {
        transform: scale(0);
        opacity: 0;
        z-index: 20;
    }

    &.scale-exit-done {
        transform: scale(0);
        opacity: 0;
        z-index: -1;
    }
`;

export const IconContainer = styled.button`
    display: flex;
    width: 32px;
    height: 32px;
    place-items: center;
    place-content: center;
    white-space: nowrap;
    border: none;
    background: transparent;
    padding: 0;
    gap: 4px;
    border-radius: 4px;
    color: rgba(var(--center-channel-color-rgb), 0.56);

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
        color: rgba(var(--center-channel-color-rgb), 0.72);
        fill: currentColor;
    }

    &:active,
    &.active,
    &.active:hover {
        background: rgba(var(--button-bg-rgb), 0.08);
        color: var(--button-bg);
        fill: currentColor;
    }

    &[disabled] {
        pointer-events: none;
        cursor: not-allowed;
        color: rgba(var(--center-channel-color-rgb), 0.32);

        &:active,
        &.active,
        &.active:hover {
            background: inherit;
            color: inherit;
            fill: inherit;
        }
    }
`;

export const DropdownContainer = styled(IconContainer)`
    width: auto;
    padding: 8px;
`;

// TODO: add generic type for the mode
type ToolbarControlProps = {
    mode: string;
    onClick: () => void;
    Icon: React.FC<IconProps>;
    label?: React.ReactNode;
    className?: string;
    ariaLabelDescriptor?: MessageDescriptor;
    shortcutDescriptor?: KeyboardShortcutDescriptor;
    disabled?: boolean;
    isActive?: boolean;
}

/**
 * by passing in the rest spread we guarantee that accessibility
 * properties like aria-label, etc. get added to the DOM
 */
const ToolbarControl = forwardRef(({mode, Icon, isActive, shortcutDescriptor, ariaLabelDescriptor, ...rest}: ToolbarControlProps, ref: ForwardedRef<HTMLButtonElement>): JSX.Element => {
    const {formatMessage} = useIntl();

    const buttonAriaLabel = ariaLabelDescriptor ? formatMessage(ariaLabelDescriptor) : '';

    const bodyAction = (
        <IconContainer
            type='button'
            id={`FormattingControl_${mode}`}
            aria-label={buttonAriaLabel}
            ref={ref}
            className={classNames({active: isActive})}
            {...rest}
        >
            <Icon
                color={'currentColor'}
                size={18}
            />
        </IconContainer>
    );

    // if no shortcut is provided return just the Actionbutton
    if (!shortcutDescriptor) {
        return bodyAction;
    }

    /* get the correct tooltip from the ShortcutsMap */
    const tooltip = (
        <Tooltip id='upload-tooltip'>
            <KeyboardShortcutSequence
                shortcut={shortcutDescriptor}
                hoistDescription={true}
                isInsideTooltip={true}
            />
        </Tooltip>
    );

    return (
        <OverlayTrigger
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='top'
            trigger={['hover', 'focus']}
            overlay={tooltip}
        >
            {bodyAction}
        </OverlayTrigger>
    );
});

export default memo(ToolbarControl);
