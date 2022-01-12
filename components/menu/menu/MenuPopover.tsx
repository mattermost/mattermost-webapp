// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Instance} from '@popperjs/core';
import React, {useEffect} from 'react';
import {usePopper} from 'react-popper';

import {MenuPopoverProps} from './Menu.types';

export const useUpdateOnVisibilityChange = (
    update: Instance['update'] | null,
    isVisible: boolean,
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
}: MenuPopoverProps): JSX.Element | null => {
    const [popperElement, setPopperElement] =
        React.useState<HTMLDivElement | null>(null);

    const {
        styles: {popper},
        attributes,
        update,
    } = usePopper(triggerRef.current, popperElement, {
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
        zIndex: isVisible ? 0 : -1,
    };

    Object.assign(style, mobileStyle || popper);

    return (
        <div
            ref={setPopperElement}
            style={style}
            {...attributes.popper}
        >
            {children}
        </div>
    );
};

export default MenuPopover;
