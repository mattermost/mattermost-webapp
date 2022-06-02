// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef, useState, useEffect} from 'react';

import {CSSTransition} from 'react-transition-group';

import styled, {css} from 'styled-components';

import {useClickOutsideRef} from 'components/global_header/hooks';

import MenuData from './MenuData';
import {MenuProps} from './Menu.types';

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

const Menu = (props: MenuProps): JSX.Element => {
    const {
        trigger,
        title,
        submenuTitle,
        submenuTrigger,
        groups,
        submenuGroups,
        placement,
        open,
        submenuOpen,
        overlayCloseHandler,
    } = props;

    const menuRef = useRef(null);
    const submenuRef = useRef(null);
    const prevOpen = usePrevious(open);
    const prevSubmenuOpen = usePrevious(submenuOpen);
    const isMobile = useIsMobile();
    const isOverlayVisible = isMobile && open;

    useClickOutsideRef([trigger.ref, menuRef, submenuRef], () => {
        if (!open || isMobile) {
            return;
        }
        if (overlayCloseHandler !== undefined) {
            overlayCloseHandler();
        }
    });

    const closeSubmenuDown =
        prevOpen && prevSubmenuOpen && !submenuOpen && !open;

    return (
        <>
            {trigger.element}
            <CSSTransition
                timeout={300}
                classNames='fade'
                in={isOverlayVisible}
                unmountOnExit={true}
            >
                <Overlay onClick={overlayCloseHandler}/>
            </CSSTransition>
            <MenuData
                menuTitle={title}
                ref={menuRef}
                groups={groups}
                trigger={trigger.ref}
                open={open}
                active={open && !submenuOpen}
                placement={placement || 'right-start'}
                isMobile={isMobile}
            />
            {submenuTrigger && submenuTrigger.ref && submenuGroups && (
                <MenuData
                    menuTitle={submenuTitle}
                    ref={submenuRef}
                    trigger={submenuTrigger.ref}
                    open={submenuOpen}
                    isSubmenu={true}
                    closeSubmenu={overlayCloseHandler}
                    closeSubmenuDown={closeSubmenuDown}
                    active={submenuOpen}
                    groups={submenuGroups}
                    placement={'right-start'}
                    isMobile={isMobile}
                />
            )}
        </>
    );
};

export default Menu;
