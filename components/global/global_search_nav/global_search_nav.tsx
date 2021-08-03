// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect} from 'react';
import Flex from '@mattermost/compass-components/utilities/layout/Flex';

import Search from 'components/search';
import QuickSwitchModal from 'components/quick_switch_modal';
import {
    Constants,
    ModalIdentifiers,
    RHSStates,
} from 'utils/constants';

import * as Utils from 'utils/utils';

type Props = {
    rhsState: typeof RHSStates[keyof typeof RHSStates] | null;
    rhsOpen: boolean;
    isQuickSwitcherOpen?: boolean;
    actions: {
        showMentions: () => void;
        openRHSSearch: () => void;
        closeRightHandSide: () => void;
        openModal: (modalData: {modalId: string; dialogType: any; dialogProps?: any}) => void;
        closeModal: (modalId: string) => void;
    };
};

const GlobalSearchNav = (props: Props): JSX.Element => {
    const {rhsState, rhsOpen, actions: {closeRightHandSide, showMentions}} = props;

    useEffect(() => {
        document.addEventListener('keydown', handleShortcut);
        document.addEventListener('keydown', handleQuickSwitchKeyPress);
    }, []);

    const searchMentions = () => {
        if (rhsState === RHSStates.MENTION) {
            closeRightHandSide();
        } else {
            showMentions();
        }
    };

    const handleShortcut = (e: KeyboardEvent) => {
        const {actions: {closeModal}} = props;

        if (Utils.cmdOrCtrlPressed(e) && e.shiftKey) {
            if (Utils.isKeyPressed(e, Constants.KeyCodes.M)) {
                e.preventDefault();
                closeModal(ModalIdentifiers.QUICK_SWITCH);
                searchMentions();
            }
            if (Utils.isKeyPressed(e, Constants.KeyCodes.L)) {
                // just close the modal if it's open, but let someone else handle the shortcut
                closeModal(ModalIdentifiers.QUICK_SWITCH);
            }
        }
    };

    const toggleQuickSwitchModal = () => {
        const {isQuickSwitcherOpen, actions: {openModal, closeModal}} = props;

        if (isQuickSwitcherOpen) {
            closeModal(ModalIdentifiers.QUICK_SWITCH);
        } else {
            openModal({
                modalId: ModalIdentifiers.QUICK_SWITCH,
                dialogType: QuickSwitchModal,
            });
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
            width={450}
            flex={1}
            alignment='center'
        >
            <Search
                isFocus={Utils.isMobile() || (rhsOpen && Boolean(rhsState))}
                enableFindShortcut={true}
            />
        </Flex>
    );
};

export default GlobalSearchNav;
