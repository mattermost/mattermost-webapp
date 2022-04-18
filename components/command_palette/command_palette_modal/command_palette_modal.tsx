// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {Modal} from 'react-bootstrap';
import {useIntl} from 'react-intl';

type Props = {
    onExited: () => void;
}

const CommandPaletteModal = ({onExited}: Props) => {
    const {formatMessage} = useIntl();
    const CommandPaletteModalLabel = formatMessage({id: 'CommandPalette.modal', defaultMessage: 'Command Palette Modal'}).toLowerCase();

    const onHide = (): void => {
        onExited();
    };

    return (
        <Modal
            dialogClassName='a11y__modal command-palette'
            show={true}
            onHide={onHide}
            enforceFocus={false}
            restoreFocus={false}
            role='dialog'
            aria-labelledby={CommandPaletteModalLabel}
            animation={false}
        >
            <Modal.Body>
                <div>
                    {'hello'}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default CommandPaletteModal;
