// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode} from 'react';

import {MenuItem, MenuItemProps, styled} from 'components/menu';

interface Props extends MenuItemProps {
    primaryLabel: ReactNode;
    leadingElement?: ReactNode;
    secondaryLabel?: ReactNode;
    trailingElement?: ReactNode;
    subMenuDetails?: ReactNode;
}

export function PopoverMenuItem(props: Props) {
    const {primaryLabel, leadingElement, secondaryLabel, trailingElement, subMenuDetails, isDestructive, ...restProps} = props;

    return (
        <MenuItemStyled
            disableRipple={true}
            disableTouchRipple={true}
            isDestructive={isDestructive}
            {...restProps}
        >
            {leadingElement}
            <div className='label-elements'>
                {primaryLabel}
                {secondaryLabel}
            </div>
            {(subMenuDetails || trailingElement) && (
                <div className='trailing-elements'>
                    {subMenuDetails}
                    {trailingElement}
                </div>
            )}
        </MenuItemStyled>
    );
}

/* eslint-disable no-negated-condition */
const MenuItemStyled = styled(MenuItem)<MenuItemProps>(({isDestructive = false}) => ({
    '&.MuiMenuItem-root': {
        fontFamily: '"Open Sans", sans-serif',
        color: !isDestructive ? 'var(--center-channel-color)' : 'var(--error-text)',
        padding: '8px 16px',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'nowrap',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',

        '&:hover': {
            backgroundColor: !isDestructive ? 'rgba(var(--center-channel-color-rgb), 0.08)' : 'var(--error-text)',
            color: isDestructive && 'var(--button-color)',
        },
        '&:hover .label-elements>:last-child': {
            color: isDestructive && 'var(--button-color)',
        },
        '&:hover .label-elements>:first-child, &:hover .label-elements>:only-child': {
            color: isDestructive && 'var(--button-color)',
        },

        '&:active': {
            'background-color': !isDestructive ? 'rgba(var(--button-bg-rgb), 0.08)' : 'background-color: rgba(var(--error-text-rgb), 0.16)',
        },

        '&.Mui-disabled': {
            color: 'rgba(var(--center-channel-color-rgb), 0.32)',
        },

        '&.Mui-focusVisible': {
            boxShadow: !isDestructive ? '0 0 0 2px var(--denim-sidebar-active-border) inset' : '0 0 0 2px rgba(var(--button-color-rgb), 0.16) inset',
            backgroundColor: isDestructive && 'rgba(var(--error-text-rgb), 0.08)',
        },

        '&>svg': {
            width: '18px',
            height: '18px',
            alignSelf: 'flex-start',
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
        '&>.label-elements>:only-child, &>.label-elements>:first-child': {
            fontSize: '14px',
            color: !isDestructive ? 'var(--center-channel-color)' : 'var(--error-text)',
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
        },
    },
}));
