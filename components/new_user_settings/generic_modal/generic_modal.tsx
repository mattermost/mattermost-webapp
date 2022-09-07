// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import {CSSTransition} from 'react-transition-group';

import './generic_modal.scss';
type Props = {
    isModalOpen: boolean;
    content: JSX.Element;
}
const GenericModal = ({content, isModalOpen}: Props): JSX.Element => {
    return (
        <CSSTransition
            timeout={300}
            unmountOnExit={true}
            mountOnEnter={true}
            in={isModalOpen}
            classNames={{
                enter: 'modalEnter',
                enterActive: 'modalEnterActive',
                exit: 'modalExit',
                exitActive: 'modalExitActive',
            }}
        >
            <div className='mm-generic-modal'>
                <div className='mm-generic-modal__header'>
                    <h1>{'Hello'}</h1>
                </div>
                <div className='mm-generic-modal__content'>
                    {content}
                </div>
            </div>
        </CSSTransition>
    );
};

export default GenericModal;
