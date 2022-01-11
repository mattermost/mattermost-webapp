// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {
    useRef,
    useState,
    useEffect,
    forwardRef,
    useCallback,
} from 'react';
import styled, {css} from 'styled-components';
import classNames from 'classnames';
import {Placement} from 'popper.js';
import {CSSTransition} from 'react-transition-group';

import {useClickOutsideRef} from 'components/global_header/hooks';

import MenuItem from '../menu-item/MenuItem';

import MenuPopover from './MenuPopover';

export const MENU_APPEAR_TRANSITION_DURATION = 300;

const Divider = () => (
    <div style={{height: '1px', width: 'auto', backgroundColor: '#e0e0e0'}}/>
);

const useIsMobile = (): boolean => {
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const mobileMediaQuery = window.matchMedia('(max-width: 699px)');

    const handleChange = (event: MediaQueryListEvent) => {
        setIsMobile(event.matches);
    };

    useEffect(() => {
        mobileMediaQuery.addEventListener('change', handleChange);
        return () => {
            mobileMediaQuery.removeEventListener('change', handleChange);
        };
    }, [handleChange]);

    useEffect(() => {
        setIsMobile(mobileMediaQuery.matches);
    }, []);

    return isMobile;
};

const MenuItems = styled.div<{isMobile: boolean; isSubmenu: boolean}>(
    ({isMobile, isSubmenu}) => {
        return isMobile ? css`
            background-color: rgba(var(--sidebar-text-rgb));
            min-height: 340px;
            height: auto;
            border-radius: 8px 8px 0 0;
            max-height: ${document.documentElement.clientHeight}px;
            overflow-y: scroll;

            transform: ${isSubmenu ? 'translateX(100%)' : 'translateY(100%)'};
            transition: transform ${MENU_APPEAR_TRANSITION_DURATION}ms
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

            transition: transform ${MENU_APPEAR_TRANSITION_DURATION}ms 0ms
                    ease-in-out,
                visibility ${MENU_APPEAR_TRANSITION_DURATION}ms 0ms
                    step-end;

            &.open.active {
                transition: transform ${MENU_APPEAR_TRANSITION_DURATION}ms
                        0ms ease-in-out,
                    visibility ${MENU_APPEAR_TRANSITION_DURATION}ms 0ms
                        step-start;
            }

            &.open:not(.active) {
                transition: transform ${MENU_APPEAR_TRANSITION_DURATION}ms
                        0ms ease-in-out,
                    visibility ${MENU_APPEAR_TRANSITION_DURATION}ms 0ms
                        step-end;
            }
        ` : css`
            border-radius: 4px;
            background-color: rgba(var(--sidebar-text-rgb));
            padding: 1rem 0;
            transform: scale(0);
            opacity: 0;
            box-shadow: 0px 20px 32px rgba(0, 0, 0, 0.12);
            transition: opacity ${MENU_APPEAR_TRANSITION_DURATION}ms
                    ease-in-out 0ms,
                transform ${MENU_APPEAR_TRANSITION_DURATION}ms ease-in-out
                    0ms;
            max-height: ${document.documentElement.clientHeight}px;
            overflow-y: scroll;

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

const Overlay = styled.div(() => {
    return css`
        background-color: rgba(0, 0, 0, 0);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        height: 100%;
        min-height: 100%;
        left: 0;
        right: 0;
        top: 0;
        position: fixed;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        pointer-events: auto;
        -ms-scroll-chaining: none;
        transition: 1s;
        transition-property: background-color;
        transition-timing-function: ease-in-out;

        &.fade-enter {
            background-color: rgba(0, 0, 0, 0);
        }

        &.fade-enter-active {
            background-color: rgba(0, 0, 0, 0.5);
        }

        &.fade-enter-done {
            background-color: rgba(0, 0, 0, 0.5);
        }

        &.fade-exit {
            background-color: rgba(0, 0, 0, 0.5);
        }

        &.fade-exit-active {
            background-color: rgba(0, 0, 0, 0);
        }

        &.fade-exit-done {
            background-color: rgba(0, 0, 0, 0);
        }
    `;
});

interface MenuDataProps {
    open: boolean;
    groups: MenuGroup;
    trigger: React.RefObject<HTMLElement>;
    placement: Placement;
    active: boolean;
    isMobile: boolean;
    menuTitle?: string;
    title?: string;
    isSubmenu?: boolean;
    closeSubmenuDown?: boolean;
    closeSubmenu?: () => void;
}

const MenuData = forwardRef<HTMLDivElement, MenuDataProps>((props, ref) => {
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
        menuTitle,
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
                        {menuTitle && <MenuTitle>{menuTitle}</MenuTitle>}
                    </MenuHeader>
                    {title && (
                        <>
                            <label>{title}</label>
                            <Divider/>
                        </>
                    )}
                    {groups.map((group, i) => (
                        <div key={i}>
                            {group.title && <label>{group.title}</label>}
                            {group.menuItems}
                            {groups.length > 1 && <Divider/>}
                        </div>
                    ))}
                </MenuItems>
            </MenuPopover>
        </>
    );
});

function usePrevious<T extends unknown>(value: T): T | undefined {
    // The ref object is a generic container whose current property is mutable
    // and can hold any value, similar to an instance property on a class
    const ref = useRef<T>();

    // Store current value in ref
    useEffect(() => {
        ref.current = value;
    }, [value]); // Only re-run if value changes
    // Return previous value (happens before update in useEffect above)

    return ref.current;
}

interface MenuProps {}

type MenuGroup = { menuItems: React.ReactNode[]; title?: string }[];

const Menu: React.ComponentType<MenuProps> = () => {
    const [open, setOpen] = useState(false);
    const [submenuOpen, setSubmenuOpen] = useState(false);
    const buttonReference = useRef<HTMLButtonElement>(null);
    const menuRef = useRef(null);
    const submenuRef = useRef(null);
    const menuItemReference = useRef(null);
    const prevOpen = usePrevious(open);
    const prevSubmenuOpen = usePrevious(submenuOpen);
    const isMobile = useIsMobile();
    const isOverlayVisible = isMobile && open;

    const closeMenu = useCallback(() => {
        setOpen(false);
        setSubmenuOpen(false);
    }, []);

    useClickOutsideRef([buttonReference, menuRef, submenuRef], () => {
        if (!open || isMobile) {
            return;
        }
        closeMenu();
    });

    const closeSubmenuDown = Boolean(prevOpen && prevSubmenuOpen && !submenuOpen && !open);

    const menuTitle = 'Parent Menu';
    const submenuTitle = 'sub Menu title';
    const menuGroup: MenuGroup = [
        {
            menuItems: [
                <MenuItem
                    ref={menuItemReference}
                    description={'Opens submenu'}
                    onClick={() => setSubmenuOpen(!submenuOpen)}
                    label='Open Submenu'
                    leadingElement={<i className='icon-plus' />}
                    trailingElementLabel='selected'
                    trailingElement={<i className='icon-chevron-right'/>}
                />,
                <MenuItem
                    destructive={true}
                    label='Join Mattermost'
                    leadingElement={
                        <i className='icon-sort-alphabetical-ascending'/>
                    }
                />,
                <MenuItem
                    disabled
                    label='Category Mattermost'
                    leadingElement={
                        <i className='icon-account-multiple-outline'/>
                    }
                />,
            ],
        },
    ];

    const submenuGroup: MenuGroup = [
        {
            menuItems: [
                <MenuItem
                    label='Leave Mattermost'
                    leadingElement={
                        <i className='icon-sort-alphabetical-ascending'/>
                    }
                />,
                <MenuItem
                    label='Open Mattermost'
                    leadingElement={
                        <i className='icon-account-multiple-outline'/>
                    }
                />,
            ],
        },
    ];

    return (
        <>
            <button
                onClick={() => setOpen(!open)}
                ref={buttonReference}
            >
                {'trigger'}
            </button>
            <CSSTransition
                timeout={MENU_APPEAR_TRANSITION_DURATION}
                classNames='fade'
                in={isOverlayVisible}
                unmountOnExit={true}
            >
                <Overlay onClick={closeMenu}/>
            </CSSTransition>
            <MenuData
                menuTitle={menuTitle}
                ref={menuRef}
                groups={menuGroup}
                trigger={buttonReference}
                open={open}
                active={open && !submenuOpen}
                placement={'right-start'}
                isMobile={isMobile}
            />
            <MenuData
                menuTitle={submenuTitle}
                ref={submenuRef}
                trigger={menuItemReference}
                open={submenuOpen}
                isSubmenu={true}
                closeSubmenu={() => setSubmenuOpen(false)}
                closeSubmenuDown={closeSubmenuDown}
                active={submenuOpen}
                groups={submenuGroup}
                placement={'right-start'}
                isMobile={isMobile}
            />
        </>
    );
};

export default Menu;
