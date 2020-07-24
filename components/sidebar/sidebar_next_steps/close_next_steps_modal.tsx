// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import GenericModal from 'components/generic_modal';

import './close_next_steps_modal.scss';

type Props = {
    onConfirm: () => void;
    onCancel: () => void;
}

export default function CloseNextStepsModal(props: Props) {
    const {onConfirm, onCancel} = props;

    return (
        <GenericModal
            show={true}
            onHide={onCancel}
            handleConfirm={onConfirm}
            handleCancel={onCancel}
            modalHeaderText={(
                <FormattedMessage
                    id={'close_next_steps_modal.header'}
                    defaultMessage={'Remove Tip & Next Steps?'}
                />
            )}
            confirmButtonText={(
                <FormattedMessage
                    id={'close_next_steps_modal.confirm'}
                    defaultMessage='Remove'
                />
            )}
        >
            <span className='CloseNextStepsModal__mainText'>
                <FormattedMessage
                    id={'close_next_steps_modal.mainText'}
                    defaultMessage='This will remove this section from your sidebar, but you can access it later in the Help section of the Main Menu.'
                />
            </span>
        </GenericModal>
    );
}
