// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';

import GenericModal from 'components/generic_modal';
import Input from 'components/widgets/inputs/input/input';

import './node-modal.scss';

type Props = {
    handleOnModalConfirm: (data: Record<string, any>) => void;
    handleOnModalCancel: () => void;
}

const NodeModal = ({handleOnModalConfirm, handleOnModalCancel}: Props) => {
    const intl = useIntl();
    const {formatMessage} = intl;
    const [displayName, setDisplayName] = useState('');

    const handleConfirm = () => {
        const data = {
            secret: displayName,
        };
        handleOnModalConfirm(data);
    };

    const handleChange = ({target: {value: data}}: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayName(data);
    };

    return (
        <GenericModal
            id='node-modal'
            className='node-modal'
            modalHeaderText={formatMessage({id: 'node_modal.modalTitle', defaultMessage: 'Create Webhook Node'})}
            confirmButtonText={formatMessage({id: 'node_modal.createNew', defaultMessage: 'Create New Node'})}
            cancelButtonText={formatMessage({id: 'channel_modal.cancel', defaultMessage: 'Cancel'})}
            isConfirmDisabled={false}
            autoCloseOnConfirmButton={false}
            useCompassDesign={true}
            handleConfirm={handleConfirm}
            handleEnterKeyPress={handleConfirm}
            handleCancel={handleOnModalCancel}
            onExited={handleOnModalCancel}
        >
            <div className='node-modal-body'>
                <Input
                    type='text'
                    name='node-modal-name'
                    containerClassName='node-modal-name-container'
                    inputClassName='node-modal-name-input'
                    label={formatMessage({id: 'node_modal.name.label', defaultMessage: 'Node name'})}
                    placeholder={formatMessage({id: 'node_modal.name.placeholder', defaultMessage: 'secret'})}
                    onChange={handleChange}
                    value={displayName}
                    data-testid='nameInput'
                    maxLength={64}
                    autoFocus={true}
                />
            </div>
        </GenericModal>
    );
};

export default NodeModal;
