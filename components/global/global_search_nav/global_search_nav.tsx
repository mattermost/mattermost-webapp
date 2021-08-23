// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import Flex from '@mattermost/compass-components/utilities/layout/Flex';

import {closeRightHandSide, showMentions} from 'actions/views/rhs';
import Search from 'components/search';
import QuickSwitchModal from 'components/quick_switch_modal';
import {getIsRhsOpen, getRhsState} from 'selectors/rhs';
import {GlobalState} from 'types/store';
import {
    Constants,
    ModalIdentifiers,
    RHSStates,
} from 'utils/constants';
import * as Utils from 'utils/utils';
import {closeModal, openModal} from 'actions/views/modals';

import {useIsModalOpen} from '../hooks';

const GlobalSearchNav = (): JSX.Element => {
    const dispatch = useDispatch();
    const rhsState = useSelector((state: GlobalState) => getRhsState(state));
    const isRhsOpen = useSelector((state: GlobalState) => getIsRhsOpen(state));
    const [, isQuickSwitcherOpenRef] = useIsModalOpen(ModalIdentifiers.QUICK_SWITCH);

    useEffect(() => {
        document.addEventListener('keydown', handleShortcut);
        document.addEventListener('keydown', handleQuickSwitchKeyPress);
        return () => {
            document.removeEventListener('keydown', handleShortcut);
            document.removeEventListener('keydown', handleQuickSwitchKeyPress);
        };
    }, []);

    const searchMentions = () => {
        if (rhsState === RHSStates.MENTION) {
            dispatch(closeRightHandSide());
        } else {
            dispatch(showMentions());
        }
    };

    const handleShortcut = (e: KeyboardEvent) => {
        if (Utils.cmdOrCtrlPressed(e) && e.shiftKey) {
            if (Utils.isKeyPressed(e, Constants.KeyCodes.M)) {
                e.preventDefault();
                dispatch(closeModal(ModalIdentifiers.QUICK_SWITCH));
                searchMentions();
            }
            if (Utils.isKeyPressed(e, Constants.KeyCodes.L)) {
                // just close the modal if it's open, but let someone else handle the shortcut
                dispatch(closeModal(ModalIdentifiers.QUICK_SWITCH));
            }
        }
    };

    const toggleQuickSwitchModal = () => {
        if (isQuickSwitcherOpenRef.current) {
            dispatch(closeModal(ModalIdentifiers.QUICK_SWITCH));
        } else {
            dispatch(openModal({
                modalId: ModalIdentifiers.QUICK_SWITCH,
                dialogType: QuickSwitchModal,
            }));
        }
    };

    const handleQuickSwitchKeyPress = (e: KeyboardEvent) => {
        if (Utils.cmdOrCtrlPressed(e) && !e.shiftKey && Utils.isKeyPressed(e, Constants.KeyCodes.K)) {
            if (!e.altKey) {
                e.preventDefault();
                toggleQuickSwitchModal();
            }
        }
    };

    return (
        <Flex
            row={true}
            width={432}
            flex={1}
            alignment='center'
        >
            <Search
                isFocus={Utils.isMobile() || (isRhsOpen && Boolean(rhsState))}
                enableFindShortcut={true}
            />
        </Flex>
    );
};

export default GlobalSearchNav;
