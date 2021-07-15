// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {MutableRefObject, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useLocation} from 'react-router';

import {GlobalState} from 'types/store';
import {GlobalHeaderSwitcherPluginComponent} from 'types/store/plugins';

const selectSwitcherItems = (state: GlobalState) => state.plugins.components.GlobalHeaderSwitcherItem;

export const useSwitcherItems = (): GlobalHeaderSwitcherPluginComponent[] => {
    return useSelector<GlobalState, GlobalHeaderSwitcherPluginComponent[]>(selectSwitcherItems);
};

/**
 * Hook that alerts clicks outside of the passed ref.
 */
export function useClickOutsideRef(ref: MutableRefObject<HTMLElement | null>, handler: () => void): void {
    useEffect(() => {
        function onMouseDown(event: MouseEvent) {
            const target = event.target as any;
            if (ref.current && target instanceof Node && !ref.current.contains(target)) {
                handler();
            }
        }

        // Bind the event listener
        document.addEventListener('mousedown', onMouseDown);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener('mousedown', onMouseDown);
        };
    }, [ref, handler]);
}

export const useCurrentProductId = () => {
    const switcherItems = useSwitcherItems();
    const location = useLocation();
    for (let i = 0; i < switcherItems.length; i++) {
        const product = switcherItems[i];
        if (product.linkURL) {
            if (location.pathname.startsWith(product.linkURL)) {
                return product.id;
            }
        }
    }

    return null;
};

