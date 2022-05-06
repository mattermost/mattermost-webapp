// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {Modal} from 'react-bootstrap';

import useGetLimits from 'components/common/hooks/useGetLimits';
import useGetUsage from 'components/common/hooks/useGetUsage';

import WorkspaceLimitsPanel, {Message, messageToElement} from './workspace_limits_panel';

import './index.scss';

interface ModalAction {
    message: Message | React.ReactNode;
    onClick: () => void;
}
interface Props {
    title: Message | React.ReactNode;
    description?: Message | React.ReactNode;
    primaryAction?: ModalAction;
    secondaryAction?: ModalAction;
    onClose: () => void;
    showIcons?: boolean;
}

export default function CloudUsageModal(props: Props) {
    const [limits] = useGetLimits();
    const usage = useGetUsage();
    const [show, setShow] = useState(true);
    return (
        <Modal
            dialogClassName='a11y__modal'
            show={show}
            onHide={() => setShow(false)}
            onExited={props.onClose}
            role='dialog'
            aria-labelledby='cloudUsageModalLabel'
            className='CloudUsageModal'
        >
            <Modal.Header
                closeButton={true}
                className='CloudUsageModal__header'
            >
                <Modal.Title
                    componentClass='h1'
                    id='cloudUsageModalLabel'
                >
                    {messageToElement(props.title)}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    {props.description && messageToElement(props.description)}
                </p>
                <WorkspaceLimitsPanel
                    showIcons={true}
                    limits={limits}
                    usage={usage}
                />
            </Modal.Body>
            {Boolean(props.primaryAction || props.secondaryAction) && (
                <Modal.Footer className='CloudUsageModal__footer'>
                    {props.secondaryAction && (
                        <button
                            type='button'
                            className='btn btn-link'
                            onClick={props.secondaryAction.onClick}
                        >
                            {messageToElement(props.secondaryAction.message)}
                        </button>
                    )}
                    {props.primaryAction && (
                        <button
                            type='button'
                            className='btn btn-primary'
                            data-dismiss='modal'
                            onClick={props.primaryAction.onClick}
                            autoFocus={true}
                            data-testid='closeLimitsModal'
                        >
                            {messageToElement(props.primaryAction.message)}
                        </button>
                    )}
                </Modal.Footer>
            )}
        </Modal>
    );
}
