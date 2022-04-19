// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect} from 'react';

import {ModalData} from 'types/actions';

import Constants, {ModalIdentifiers} from 'utils/constants';
import {cmdOrCtrlPressed, isKeyPressed} from 'utils/utils';

import {CommandPaletteEntities} from 'components/command_palette/types';
import CommandPaletteModal from 'components/command_palette/command_palette_modal';

interface Props {
    isCommandPaletteOpen: boolean;
    actions: {
        openModal: <P>(modalData: ModalData<P>) => void;
        closeModal: (modalId: string) => void;
    };
}

function CommandPalette({isCommandPaletteOpen, actions: {closeModal, openModal}}: Props) {
    function handleCommandPaletteShortcut(e: KeyboardEvent) {
        if (cmdOrCtrlPressed(e) && !e.shiftKey && isKeyPressed(e, Constants.KeyCodes.K) && !e.altKey) {
            e.preventDefault();
            toggleCommandPalette([CommandPaletteEntities.Channel, CommandPaletteEntities.Boards, CommandPaletteEntities.Playbooks]);
        } else if (cmdOrCtrlPressed(e) && !e.shiftKey && isKeyPressed(e, Constants.KeyCodes.F) && !e.altKey) {
            e.preventDefault();
            toggleCommandPalette([CommandPaletteEntities.Files]);
        }
    }

    function toggleCommandPalette(selectedEntities: CommandPaletteEntities[]) {
        if (isCommandPaletteOpen) {
            closeModal(ModalIdentifiers.COMMAND_PALETTE);
        } else {
            openModal({
                modalId: ModalIdentifiers.COMMAND_PALETTE,
                dialogType: CommandPaletteModal,
                dialogProps: {
                    selectedEntities,
                },
            });
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', handleCommandPaletteShortcut);

        return (() => {
            document.removeEventListener('keydown', handleCommandPaletteShortcut);
        });
    }, []);

    return (
        null
    );
}

export default CommandPalette;
