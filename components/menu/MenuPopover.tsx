// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Instance} from '@popperjs/core';
import React, {useEffect, useRef} from 'react';
import {usePopper} from 'react-popper';
import {CSSTransition} from 'react-transition-group';

import RootPortal from 'components/root_portal';

import {useClickOutsideRef} from 'components/global_header/hooks';

import {MenuPopoverProps} from './Menu.types';
import {Overlay} from './Menu.styles';

export const useUpdateOnVisibilityChange = (
    update: Instance['update'] | null,
    isVisible?: boolean,
) => {
    const updateComponent = async () => {
        if (!update) {
            return;
        }
        await update();
    };

    useEffect(() => {
        if (!isVisible) {
            return;
        }
        updateComponent();
    }, [isVisible]);
};

const MenuPopover = ({
    triggerRef,
    isVisible,
    isMobile,
    placement = 'auto',
    offset = [0, -4],
    children,
    zIndex,
    overlayCloseHandler,
}: MenuPopoverProps): JSX.Element | null => {
    const popperElement = useRef(null);

    const {
        styles: {popper},
        attributes,
        update,
    } = usePopper(triggerRef.current, popperElement.current, {
        placement,
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset,
                },
            },
        ],
    });
    useUpdateOnVisibilityChange(update, isVisible);

    const mobileStyle = isMobile && {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        transition: 'visibility 300ms 0ms step-end',
    };

    const style = {
        zIndex: isVisible ? zIndex : -1,
    };

    Object.assign(style, mobileStyle || popper);

    useClickOutsideRef(popperElement, () => {
        if (overlayCloseHandler !== undefined) {
            overlayCloseHandler();
        }
    });

    return (
        <RootPortal>
            <CSSTransition
                timeout={300}
                classNames='fade'
                in={isVisible}
                unmountOnExit={true}
            >
                <Overlay
                    isMobile={isMobile}
                    onClick={overlayCloseHandler}
                />
            </CSSTransition>
            <div
                ref={popperElement}
                style={style}
                {...attributes.popper}
            >
                {children}
            </div>
        </RootPortal>
    );
};

export default MenuPopover;
