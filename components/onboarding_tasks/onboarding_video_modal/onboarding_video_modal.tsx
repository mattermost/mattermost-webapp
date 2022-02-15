// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';
import {Modal} from 'react-bootstrap';

import {OnboardingTaskList} from '../constants';
import './onboarding_video_modal.scss';

type Props = {
    onExited: () => void;
}

const OnBoardingVideoModal = ({onExited}: Props) => {
    const [show, setShow] = useState(true);

    const handleHide = useCallback(() => {
        setShow(!show);
    }, [show]);

    return (
        <Modal
            id={OnboardingTaskList.ONBOARDING_VIDEO_MODAL}
            dialogClassName='a11y__modal on-boarding-video_modal'
            show={show}
            onHide={handleHide}
            onExited={onExited}
            enforceFocus={false}
            role='dialog'
            aria-labelledby='onBoardingVideoModal'
        >
            <Modal.Header
                closeButton={true}
            />
            <Modal.Body>
                <iframe
                    src='//fast.wistia.net/embed/iframe/3t4dpc0k6b'
                    allowTransparency={true}
                    frameBorder='0'
                    scrolling='no'
                    className='wistia_embed'
                    name='wistia_embed'
                    allowFullScreen={true}
                />
            </Modal.Body>
        </Modal>
    );
};

export default OnBoardingVideoModal;
