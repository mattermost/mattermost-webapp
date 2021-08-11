// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {MutableRefObject, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useLocation} from 'react-router';

import {GlobalState} from 'types/store';
import {ProductComponent} from 'types/store/plugins';
import {getBasePath} from 'utils/url';
import {Preferences, TutorialSteps, TopLevelProducts} from 'utils/constants';

import {savePreferences} from 'mattermost-redux/actions/preferences';
import {getCurrentUserId} from 'mattermost-redux/selectors/entities/users';
import {getInt} from 'mattermost-redux/selectors/entities/preferences';

import store from 'stores/redux_store';

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

export const useShowTutorialStep = (stepToShow: number, products?: ProductComponent[]): boolean => {
    const currentUserId = useSelector<GlobalState, string>(getCurrentUserId);
    const boundGetInt = (state: GlobalState) => getInt(state, Preferences.TUTORIAL_STEP, currentUserId, 0);

    const step = useSelector<GlobalState, number>(boundGetInt);
    const useThunkDispatch = () => useDispatch<typeof store.dispatch>();

    const showTutorialStep = step === stepToShow;

    // If user does not have access to these other products,
    // we do not want to show them the tutorial.
    // We wait until global_header is displayed to do it because it could happen that their
    // Mattermost instance gets Boards & Playbooks enabled after they complete the previous tip,
    // but before they get access to the global header,
    // and in that case we still want them to see the tutorial.
    if (showTutorialStep && stepToShow === TutorialSteps.PRODUCT_SWITCHER) {
        // If there are no products loaded yet,
        // we can not be sure whether boards & playbooks are enabled.
        if (!products) {
            return showTutorialStep;
        }

        const hasPlaybooks = products.some((x) => x.switcherText === TopLevelProducts.PLAYBOOKS);
        const hasBoards = products.some((x) => x.switcherText === TopLevelProducts.BOARDS);
        if (!hasPlaybooks || !hasBoards) {
            savePreferences(
                currentUserId,
                [{
                    user_id: currentUserId,
                    category: Preferences.TUTORIAL_STEP,
                    name: currentUserId,
                    value: (TutorialSteps.PRODUCT_SWITCHER + 1).toString(),
                }],
            )(useThunkDispatch);
            return false;
        }
    }

    return showTutorialStep;
};
