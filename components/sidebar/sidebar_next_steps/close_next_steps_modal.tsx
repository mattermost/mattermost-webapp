// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import ReactDOM from 'react-dom';
import {FormattedMessage} from 'react-intl';

import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import GenericModal from 'components/generic_modal';
import closeNextStepsArrow from 'images/close_next_steps_arrow.svg';

import './close_next_steps_modal.scss';

type Props = {
    screenTitle: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function CloseNextStepsModal(props: Props) {
    const {onConfirm, onCancel, screenTitle} = props;

    return (
        <>
            {ReactDOM.createPortal(
                <div className='CloseNextStepsModal__helpBox'>
                    <img
                        className='CloseNextStepsModal__arrow'
                        src={closeNextStepsArrow}
                    />
                    <span className='CloseNextStepsModal__helpText'>
                        <FormattedMarkdownMessage
                            id='close_next_steps_modal.helpText'
                            defaultMessage='Access {title} any time through the Main Menu'
                            values={{
                                title: screenTitle,
                            }}
                        />
                    </span>
                </div>,
                document.body as HTMLElement
            )}
            <GenericModal
                className='CloseNextStepsModal'
                show={true}
                onHide={onCancel}
                handleConfirm={onConfirm}
                handleCancel={onCancel}
                modalHeaderText={(
                    <FormattedMarkdownMessage
                        id={'close_next_steps_modal.header'}
                        defaultMessage={'Remove {title}?'}
                        values={{
                            title: screenTitle,
                        }}
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
