// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ForwardedRef} from 'react';
import styled, {css} from 'styled-components';
import classNames from 'classnames';

import MenuPopover from './MenuPopover';
import {MenuDataProps} from './Menu.types';

const Divider = () => (
    <div style={{height: '1px', width: 'auto', backgroundColor: '#e0e0e0'}}/>
);

const MenuItems = styled.div<{isMobile: boolean; isSubmenu: boolean}>(
    ({isMobile, isSubmenu}) => {
        return isMobile ? css`
            background-color: rgba(var(--sidebar-text-rgb));
            min-height: 340px;
            height: auto;
            border-radius: 8px 8px 0 0;
            max-height: ${document.documentElement.clientHeight}px;
            overflow-y: auto;

            transform: ${isSubmenu ? 'translateX(100%)' : 'translateY(100%)'};
            transition: transform 300ms
                    ease-in-out 0ms,
                &.open {
                transform: translateY(0);
            }

            &.closeSubmenuDown {
                transform: translateY(100%);
            }

            &.open.active {
                position: relative;
                transform: translateX(0%);
                visibility: visible;
                z-index: 2;
            }

            &.open:not(.active) {
                transform: translateX(-100%);
                visibility: hidden;
            }

            transition: transform 300ms 0ms
                    ease-in-out,
                visibility 300ms 0ms
                    step-end;

            &.open.active {
                transition: transform 300ms
                        0ms ease-in-out,
                    visibility 300ms 0ms
                        step-start;
            }

            &.open:not(.active) {
                transition: transform 300ms
                        0ms ease-in-out,
                    visibility 300ms 0ms
                        step-end;
            }
        ` : css`
            border-radius: 4px;
            background-color: rgba(var(--sidebar-text-rgb));
            padding: 1rem 0;
            transform: scale(0);
            opacity: 0;
            box-shadow: 0px 20px 32px rgba(0, 0, 0, 0.12);
            transition: opacity 300ms
                    ease-in-out 0ms,
                transform 300ms ease-in-out
                    0ms;
            max-height: ${document.documentElement.clientHeight}px;
            overflow-y: auto;

            &.open {
                transform: scale(1);
                opacity: 1;
            }
        `;
    },
);

const MenuHeader = styled.div`
    display: flex;
    justify-content: center;

    &.isMobile {
        height: 52px;
    }

    &.hasArrow {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
    }
`;

const MenuTitle = styled.div`
    display: flex;
    align-items: center;
    color: var(--center-channel-color);
`;

const MenuData = React.forwardRef((props: MenuDataProps, ref: ForwardedRef<null>): JSX.Element => {
    const {
        title,
        open,
        groups,
        trigger,
        placement,
        active,
        isSubmenu,
        closeSubmenu,
        closeSubmenuDown,
        isMobile,
    } = props;

    return (
        <>
            <MenuPopover
                isVisible={open}
                triggerRef={trigger}
                placement={placement}
                isMobile={isMobile}
            >
                <MenuItems
                    ref={ref}
                    isMobile={isMobile}
                    isSubmenu={Boolean(isSubmenu)}
                    className={classNames({
                        open,
                        active,
                        closeSubmenuDown,
                    })}
                >
                    <MenuHeader
                        className={classNames({
                            hasArrow: isSubmenu && isMobile,
                            isMobile,
                        })}
                    >
                        {isSubmenu && isMobile && (
                            <i
                                className='icon icon-arrow-back-ios'
                                style={{
                                    margin: '0 auto 0 23px',
                                    color: '#3D3C40',
                                }}
                                onClick={closeSubmenu}
                            />
                        )}
                        {title && <MenuTitle>{title}</MenuTitle>}
                    </MenuHeader>
                    {groups.map((group) => (
                        <>
                            {group.title && <label>{group.title}</label>}
                            {group.menuItems}
                            {groups.length > 1 && <Divider/>}
                        </>
                    ))}
                </MenuItems>
            </MenuPopover>
        </>
    );
});

export default MenuData;
