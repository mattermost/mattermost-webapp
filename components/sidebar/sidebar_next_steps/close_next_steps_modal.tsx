// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import GenericModal from 'components/generic_modal';
import closeNextStepsArrow from 'images/close_next_steps_arrow.svg';

import './close_next_steps_modal.scss';

type Props = {
    onConfirm: () => void;
    onCancel: () => void;
}

export default function CloseNextStepsModal(props: Props) {
    const {onConfirm, onCancel} = props;

    return (
        <>
            {ReactDOM.createPortal(
                <div className='CloseNextStepsModal__helpBox'>
                    <img
                        className='CloseNextStepsModal__arrow'
                        src={closeNextStepsArrow}
                    />
                    <span className='CloseNextStepsModal__helpText'>
                        <FormattedMessage
                            id='close_next_steps_modal.helpText'
                            defaultMessage='Access Tips & Next Steps any time through the Help section in the Main Menu'
                        />
                    </span>
                </div>,
                document.body as HTMLElement
            )}
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
                <FormattedMessage
                    id={'close_next_steps_modal.mainText'}
                    defaultMessage='This will remove this section from your sidebar, but you can access it later in the Help section of the Main Menu.'
                />
            </GenericModal>
        </>
    );
}
