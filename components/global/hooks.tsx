// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {MutableRefObject, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useLocation} from 'react-router';

import {GlobalState} from 'types/store';
import {ProductComponent} from 'types/store/plugins';
import {getBasePath} from 'utils/url';

const selectProducts = (state: GlobalState) => state.plugins.components.Product;

export const useProducts = (): ProductComponent[] | undefined => {
    return useSelector<GlobalState, ProductComponent[]>(selectProducts);
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

export const useCurrentProductId = (products?: ProductComponent[]): string | null => {
    if (!products) {
        return null;
    }

    const location = useLocation();
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        if (location.pathname.startsWith(getBasePath() + product.baseURL)) {
            return product.id;
        }
    }

    return null;
};

