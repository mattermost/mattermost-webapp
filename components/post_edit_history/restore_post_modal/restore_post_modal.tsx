// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useRef} from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage} from 'react-intl';

import {useSelector} from 'react-redux';

import {Post} from '@mattermost/types/posts';
import {isModalOpen} from 'selectors/views/modals';
import {GlobalState} from 'types/store';
import {ModalIdentifiers} from 'utils/constants';

type Props = {
    post: Post;
    actions: {
        handleRestore: (post: Post) => void;
        closeModal: (modalId: string) => void;
    };
}

const RestorePostModal = ({post, actions}: Props) => {
    const restorePostBtn = useRef<HTMLButtonElement>(null);
    const show = useSelector((state: GlobalState) => isModalOpen(state, ModalIdentifiers.RESTORE_POST_MODAL));

    const handleRestore = async () => {
        await actions.handleRestore(post);
        onHide();
    };

    const handleEntered = () => restorePostBtn?.current?.focus();

    const onHide = () => actions.closeModal(ModalIdentifiers.RESTORE_POST_MODAL);

    return (
        <Modal
            dialogClassName='a11y__modal channel-invite'
            show={show}
            onEntered={handleEntered}
            onHide={onHide}
            enforceFocus={false}
            id='restorePostModal'
            role='dialog'
            aria-labelledby='restorePostModalLabel'
        >
            <Modal.Header closeButton={true}/>
            <Modal.Body
                role='application'
                className='overflow--visible'
            >
                <div className='edit-post__restore__modal__header'>
                    <FormattedMessage
                        id='restore_post.title'
                        defaultMessage='Restore this message?'
                    />
                </div>
                <div className='edit-post__restore__modal__content'>
                    {post.message}
                </div>
            </Modal.Body>
            <Modal.Footer className='edit-post__restore__modal__footer' >
                <button
                    type='button'
                    className='btn cancel-button'
                    onClick={onHide}
                >
                    <FormattedMessage
                        id='generic_modal.cancel'
                        defaultMessage='Cancel'
                    />
                </button>
                <button
                    ref={restorePostBtn}
                    type='button'
                    autoFocus={true}
                    className='btn btn-primary'
                    onClick={handleRestore}
                    id='restorePostModalButton'
                >
                    <FormattedMessage
                        id='generic_modal.confirm'
                        defaultMessage='Confirm'
                    />
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default RestorePostModal;
