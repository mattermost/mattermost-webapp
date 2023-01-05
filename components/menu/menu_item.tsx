// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactElement, ReactNode} from 'react';
import {styled} from '@mui/material/styles';
import MuiMenuItem from '@mui/material/MenuItem';
import type {MenuItemProps as MuiMenuItemProps} from '@mui/material/MenuItem';

export interface Props extends MuiMenuItemProps {

    /**
     * To support quick recognition of menu item. Could be icon, avatar or emoji.
     */
    leadingElement?: ReactNode;

    /**
     * There can be two labels for a menu item - primaryLabel and secondaryLabel.
     * If only one element is passed, it will be primaryLabel. And if another element is passed, it will be secondaryLabel.
     * @example
     * <Menu.Item labels={<FormattedMessage id="primary.label" defaultMessage="primary Label"/>}/>
     *
     * @example
     * <Menu.Item labels={
     *  <>
     *   <FormattedMessage id="primary.label" defaultMessage="primary Label"/>
     *   <FormattedMessage id="secondary.label" defaultMessage="secondary Label"/>
     * </>
     * }/>
     *
     * @note
     * Wraps the labels with element such as span, div etc. to support styling instead of passing text node directly.
     */
    labels: ReactElement;

    /**
     * The meta data element to display extra information about menu item. Could be chevron, shortcut or badge.
     * It is formed with subMenuDetail and trailingElement. If only one is passed, it will be tailingElement. If two are
     * passed, first will be subMenuDetail and second will be trailingElement.
     *
     * @example
     * <Menu.Item trailingElements={<Badge/>}/>
     *
     * @example
     * <Menu.Item trailingElements={
     *  <>
     *   <FormattedMessage id="submenu.detail" defaultMessage="submenu detail"/>
     *   <Badge/>
     * </>
     * }/>
     */
    trailingElements?: ReactNode;

    /**
     * For actions of menu item that are destructive in nature and harder to undo.
     */
    isDestructive?: boolean;
    children?: ReactNode;
}

/**
 * To be used as a child of Menu component.
 * Checkout Compass's Menu Item(compass.mattermost.com)  for terminology, styling and usage guidelines.
 *
 * @example
 * <Menu.Container>
 *    <Menu.Item/>
 * </Menu.Container>
 *
 * @caution
 * avoid passing children to this component. Support for children is only added to support submenus.
 */
export function MenuItem(props: Props) {
    const {
        leadingElement,
        labels,
        trailingElements,
        isDestructive,
        children,
        ...restProps
    } = props;

    return (
        <MenuItemStyled
            disableRipple={true}
            disableTouchRipple={true}
            isDestructive={isDestructive}
            {...restProps}
        >
            {leadingElement && <div className='leading-element'>{leadingElement}</div>}
            <div className='label-elements'>{labels}</div>
            {trailingElements && <div className='trailing-elements'>{trailingElements}</div>}
            {children}
        </MenuItemStyled>
    );
}

/* eslint-disable no-negated-condition */
const MenuItemStyled = styled(MuiMenuItem, {
    shouldForwardProp: (prop) => prop !== 'isDestructive',
})<MuiMenuItemProps & Pick<Props, 'isDestructive'>>(
    ({isDestructive = false}) => ({
        '&.MuiMenuItem-root': {
            fontFamily: '"Open Sans", sans-serif',
            color: !isDestructive ? 'var(--center-channel-color)' : 'var(--error-text)',
            padding: '8px 20px 8px 16px',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            justifyContent: 'flex-start',
            alignItems: 'center',
            pointerEvents: 'auto', // To resume pointer events if they were disabled by the parent submenu

            '&:hover': {
                backgroundColor: !isDestructive ? 'rgba(var(--center-channel-color-rgb), 0.08)' : 'var(--error-text)',
                color: isDestructive && 'var(--button-color)',
            },

            '&:active': {
                'background-color': !isDestructive ? 'rgba(var(--button-bg-rgb), 0.08)' : 'background-color: rgba(var(--error-text-color-rgb), 0.16)',
            },

            '&.Mui-disabled': {
                color: 'rgba(var(--center-channel-color-rgb), 0.32)',
            },

            '&.Mui-focusVisible': {
                boxShadow: !isDestructive ? '0 0 0 2px var(--denim-sidebar-active-border) inset' : '0 0 0 2px rgba(var(--button-color-rgb), 0.16) inset',
                backgroundColor: !isDestructive ? 'var(--center-channel-bg)' : 'var(--error-text)',
                color: isDestructive && 'var(--button-color)',
            },
            '&.Mui-focusVisible .label-elements>:last-child, &.Mui-focusVisible .label-elements>:first-child, &.Mui-focusVisible .label-elements>:only-child': {
                color: isDestructive && 'var(--button-color)',
            },

            '&>.leading-element': {
                width: '18px',
                height: '18px',
                color: !isDestructive ? 'rgba(var(--center-channel-color-rgb), 0.56)' : 'var(--error-text)',
            },
            '&:hover .leading-element': {
                color: !isDestructive ? 'rgba(var(--center-channel-color-rgb), 0.72)' : 'var(--button-color)',
            },

            '&>.label-elements': {
                display: 'flex',
                flex: '1 0 auto',
                alignSelf: 'stretch',
                flexDirection: 'column',
                fontWeight: 400,
                textAlign: 'start',
                paddingInlineStart: '8px',
                gap: '4px',
                lineHeight: '16px',
            },

            '&>.label-elements>:last-child': {
                fontSize: '12px',
                color: !isDestructive ? 'rgba(var(--center-channel-color-rgb), 0.56)' : 'var(--error-text)',
            },
            '&:hover .label-elements>:last-child': {
                color: isDestructive && 'var(--button-color)',
            },

            '&>.label-elements>:first-child, &>.label-elements>:only-child': {
                fontSize: '14px',
                color: !isDestructive ? 'var(--center-channel-color)' : 'var(--error-text)',
            },
            '&:hover .label-elements>:first-child, &:hover .label-elements>:only-child': {
                color: isDestructive && 'var(--button-color)',
            },

            '&>.trailing-elements': {
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                justifyContent: 'flex-end',
                color: 'rgba(var(--center-channel-color-rgb), 0.56)',
                gap: '4px',
                marginInlineStart: '24px',
                fontSize: '12px',
                lineHeight: '16px',
                alignItems: 'center',
            },
            '&:hover .trailing-elements': {
                color: 'rgba(var(--center-channel-color-rgb), 0.72)',
            },
        },
    }),
);
