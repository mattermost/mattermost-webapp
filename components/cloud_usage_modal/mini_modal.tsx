// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState} from 'react';
import {Modal} from 'react-bootstrap';

import {Limits} from '@mattermost/types/cloud';
import {CloudUsage} from 'components/common/hooks/useGetUsage';

import WorkspaceLimitsPanel, {Message, messageToElement} from './workspace_limits_panel';

interface Props {
    limits: Limits;
    usage: CloudUsage;
    showIcons?: boolean;
    title: Message | React.ReactNode;
    onClose: () => void;
}

export default function MiniModal(props: Props) {
    const [show, setShow] = useState(true);

    return (
        <Modal
            dialogClassName='a11y__modal'
            show={show}
            onHide={() => setShow(false)}
            onExited={props.onClose}
            role='dialog'
            aria-labelledby='cloudUsageModalMiniLabel'
        >
            <Modal.Header closeButton={true}>
                <Modal.Title
                    componentClass='h1'
                    id='cloudUsageModalMiniLabel'
                >
                    {messageToElement(props.title)}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <WorkspaceLimitsPanel
                    limits={props.limits}
                    usage={props.usage}
                    showIcons={false}
                />
            </Modal.Body>
        </Modal>
    );
}
