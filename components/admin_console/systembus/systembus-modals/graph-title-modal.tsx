// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {useIntl} from 'react-intl';

import GenericModal from 'components/generic_modal';
import './node-modal.scss';
import Input from '../../../widgets/inputs/input/input';

type Props = {
    handleOnModalConfirm: (title: string) => void;
    handleOnModalCancel: () => void;
}

const GraphTitleModal = ({handleOnModalConfirm, handleOnModalCancel}: Props) => {
    const intl = useIntl();
    const {formatMessage} = intl;
    const [title, setTitle] = useState('');

    const modalHeader = formatMessage({id: 'new-graph-title.modalTitle', defaultMessage: 'Create Graph Title'});

    const handleConfirm = () => {
        handleOnModalConfirm(title);
    };
    const handleChange = ({target: {value: data}}: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(data);
    };

    return (
        <GenericModal
            id='node-modal'
            className='node-modal'
            modalHeaderText={modalHeader}
            confirmButtonText={modalHeader}
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
                    label={formatMessage({id: 'node_modal.name.label', defaultMessage: 'New graph title'})}
                    placeholder={formatMessage({id: 'node_modal.name.placeholder', defaultMessage: 'New graph title'})}
                    onChange={handleChange}
                    value={title}
                    data-testid='nameInput'
                    maxLength={64}
                    autoFocus={true}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleConfirm();
                        }
                    }}
                />
            </div>
        </GenericModal>
    );
};

export default GraphTitleModal;
