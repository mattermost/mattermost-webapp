// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {MutableRefObject, useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';
import {useLocation} from 'react-router';

import {GlobalState} from 'types/store';
import {ProductComponent} from 'types/store/plugins';
import {getBasePath} from 'utils/url';
import {Preferences} from 'utils/constants';

import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';

import {isModalOpen} from 'selectors/views/modals';

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

export const useShowTutorialStep = (stepToShow: number): boolean => {
    const currentUserId = useSelector<GlobalState, string>(getCurrentUserId);
    const boundGetInt = (state: GlobalState) => getInt(state, Preferences.TUTORIAL_STEP, currentUserId, 0);
    const step = useSelector<GlobalState, number>(boundGetInt);

    return step === stepToShow;
};

/**
 * Hook that returns the current open state of the specified modal
 * - returns both the direct boolean for regular use and a ref that contains the boolean for usage in a callback
 */
export const useIsModalOpen = (modalIdentifier: string): [boolean, React.RefObject<boolean>] => {
    const modalOpenState = useSelector((state: GlobalState) => isModalOpen(state, modalIdentifier));
    const modalOpenStateRef = useRef(modalOpenState);

    useEffect(() => {
        modalOpenStateRef.current = modalOpenState;
    }, [modalOpenState]);

    return [modalOpenState, modalOpenStateRef];
};
