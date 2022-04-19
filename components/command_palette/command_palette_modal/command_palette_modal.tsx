// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {Modal} from 'react-bootstrap';
import {useIntl} from 'react-intl';

import {CommandPaletteEntities} from 'components/command_palette/types';

interface Props {
    selectedEntities: CommandPaletteEntities[];
    onExited: () => void;
}

const CommandPaletteModal = ({onExited, selectedEntities}: Props) => {
    const [modalVisibility, setModalVisibility] = useState(true);
    const {formatMessage} = useIntl();
    const CommandPaletteModalLabel = formatMessage({id: 'CommandPalette.modal', defaultMessage: 'Command Palette Modal'}).toLowerCase();

    const onHide = (): void => {
        setModalVisibility(false);
    };

    return (
        <Modal
            dialogClassName='a11y__modal command-palette'
            role='dialog'
            aria-labelledby={CommandPaletteModalLabel}
            show={modalVisibility}
            enforceFocus={true}
            restoreFocus={false}
            onHide={onHide}
            onExited={onExited}
        >
            <Modal.Body>
                <div>
                    {'hello'}
                    {selectedEntities.join(', ')}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default CommandPaletteModal;
